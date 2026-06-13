const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Read and extract requirements from policy text file
function parsePolicyDocument() {
  const filePath = path.join(__dirname, '../../sample-data/policy_documents.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const policies = [];
  const blocks = content.split('---');

  blocks.forEach(block => {
    const policyIdMatch = block.match(/POLICY_ID:\s*(\S+)/);
    const policyNameMatch = block.match(/POLICY:\s*(.+)/);
    const requirementBlocks = block.split(/REQUIREMENT \d+:/);

    requirementBlocks.shift();

    requirementBlocks.forEach((req, index) => {
      const lines = req.trim().split('\n');
      policies.push({
        requirement_id: `REQ-${policyIdMatch?.[1]}-${index + 1}`,
        policy_id: policyIdMatch?.[1] || 'UNKNOWN',
        policy_name: policyNameMatch?.[1]?.trim() || 'UNKNOWN',
        description: lines[0]?.trim() || '',
        responsible: lines.find(l => l.includes('Responsible'))?.split(':')[1]?.trim() || '',
        scope: lines.find(l => l.includes('Scope'))?.split(':')[1]?.trim() || '',
        evidence_source: lines.find(l => l.includes('Evidence Source'))?.split(':')[1]?.trim() || '',
        audit_frequency: lines.find(l => l.includes('Audit Frequency'))?.split(':')[1]?.trim() || '',
        compliance_mapping: lines.find(l => l.includes('Compliance Mapping'))?.split(':')[1]?.trim().split(',').map(s => s.trim()) || []
      });
    });
  });

  return policies;
}

// Read evidence CSV file
function parseEvidence() {
  return new Promise((resolve) => {
    const results = [];
    const filePath = path.join(__dirname, '../../sample-data/evidence_artifacts.csv');
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results));
  });
}

// Decide compliance status based on evidence data
function determineStatus(evidence) {
  if (!evidence) return 'gap';
  
  const marker = evidence.anomaly_marker?.trim();
  const confidence = parseFloat(evidence.confidence_score);
  const freshness = parseInt(evidence.freshness_days);

  if (marker === 'STALE_EVIDENCE' || freshness > 90) return 'stale';
  if (marker === 'COMPLIANCE_GAP' || marker === 'MISSING_DOCUMENTATION') return 'gap';
  if (confidence < 0.6) return 'low_confidence';
  if (evidence.status === 'Approved' && confidence >= 0.7) return 'compliant';
  
  return 'gap';
}

// Link requirements to evidence and return final result
async function mapEvidenceToRequirements() {
  const requirements = parsePolicyDocument();
  const evidenceList = await parseEvidence();

  const mapped = requirements.map(req => {
    const matchingEvidence = evidenceList.filter(e => 
      e.framework && req.compliance_mapping.some(c => 
        c.includes(e.framework)
      )
    );

    const bestEvidence = matchingEvidence[0] || null;
    const status = determineStatus(bestEvidence);

    return {
      ...req,
      status,
      evidence: bestEvidence,
      totalEvidence: matchingEvidence.length
    };
  });

  return mapped;
}

module.exports = { mapEvidenceToRequirements, parsePolicyDocument, parseEvidence, determineStatus };