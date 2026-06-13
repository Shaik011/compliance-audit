const express = require('express');
const router = express.Router();
const { mapEvidenceToRequirements } = require('../utils/mapper');

// Generate narrative for each requirement
function generateNarrative(req) {
  const status = req.status;
  const description = req.description;
  const framework = req.compliance_mapping?.join(', ');
  const evidence = req.evidence;
  const collector = evidence?.collected_by || 'Unknown';
  const date = evidence?.collection_date || 'Unknown';
  const location = evidence?.evidence_location || 'Unknown';

  if (status === 'compliant') {
    return `Organization has demonstrated compliance with "${description}". Evidence was collected by ${collector} on ${date} from ${location}. Control is verified and current. Compliant with ${framework}.`;
  }
  if (status === 'stale') {
    return `Evidence for "${description}" exists but is outdated (${evidence?.freshness_days} days old). Evidence was last collected by ${collector} on ${date}. Immediate re-collection required to maintain compliance with ${framework}.`;
  }
  if (status === 'gap') {
    return `A compliance gap was detected for "${description}". Evidence is either missing, rejected, or flagged as non-compliant. Immediate remediation required to meet ${framework} requirements.`;
  }
  if (status === 'low_confidence') {
    return `Evidence for "${description}" exists but has low confidence score (${(parseFloat(evidence?.confidence_score) * 100).toFixed(0)}%). Additional verification needed to confirm compliance with ${framework}.`;
  }
  return `No evidence found for "${description}". Control requires evidence to demonstrate compliance with ${framework}.`;
}

// Generate next review date based on audit frequency
function getNextReviewDate(auditFrequency) {
  const now = new Date();
  if (auditFrequency?.toLowerCase().includes('daily')) {
    now.setDate(now.getDate() + 1);
  } else if (auditFrequency?.toLowerCase().includes('weekly')) {
    now.setDate(now.getDate() + 7);
  } else if (auditFrequency?.toLowerCase().includes('monthly')) {
    now.setMonth(now.getMonth() + 1);
  } else if (auditFrequency?.toLowerCase().includes('quarterly')) {
    now.setMonth(now.getMonth() + 3);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString().split('T')[0];
}

router.get('/', async (req, res) => {
  try {
    const mapped = await mapEvidenceToRequirements();

    const summary = {
      total: mapped.length,
      compliant: mapped.filter(r => r.status === 'compliant').length,
      gap: mapped.filter(r => r.status === 'gap').length,
      stale: mapped.filter(r => r.status === 'stale').length,
      low_confidence: mapped.filter(r => r.status === 'low_confidence').length,
    };

    summary.compliance_percentage = Math.round(
      (summary.compliant / summary.total) * 100
    );

    const byFramework = {};
    mapped.forEach(req => {
      req.compliance_mapping.forEach(framework => {
        if (!byFramework[framework]) {
          byFramework[framework] = { compliant: 0, gap: 0, stale: 0, low_confidence: 0 };
        }
        byFramework[framework][req.status]++;
      });
    });

    // Add narrative, evidence_links, next_review_date to each requirement
    const requirements = mapped.map(req => ({
      ...req,
      compliance_status: req.status.toUpperCase(),
      narrative: generateNarrative(req),
      evidence_links: req.evidence ? [
        req.evidence.evidence_location,
        req.evidence.evidence_type,
        req.evidence.evidence_id
      ].filter(Boolean) : [],
      next_review_date: getNextReviewDate(req.audit_frequency)
    }));

    res.json({
      success: true,
      data: { summary, byFramework, requirements }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;