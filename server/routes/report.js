const express = require('express');
const router = express.Router();
const { mapEvidenceToRequirements } = require('../utils/mapper');

// Generate compliance report
router.get('/', async (req, res) => {
  try {
    const mapped = await mapEvidenceToRequirements();

    // Count statuses
    const summary = {
      total: mapped.length,
      compliant: mapped.filter(r => r.status === 'compliant').length,
      gap: mapped.filter(r => r.status === 'gap').length,
      stale: mapped.filter(r => r.status === 'stale').length,
      low_confidence: mapped.filter(r => r.status === 'low_confidence').length,
    };

    // Compliance percentage
    summary.compliance_percentage = Math.round(
      (summary.compliant / summary.total) * 100
    );

    // Group by framework
    const byFramework = {};
    mapped.forEach(req => {
      req.compliance_mapping.forEach(framework => {
        if (!byFramework[framework]) {
          byFramework[framework] = { compliant: 0, gap: 0, stale: 0, low_confidence: 0 };
        }
        byFramework[framework][req.status]++;
      });
    });

    res.json({
      success: true,
      data: {
        summary,
        byFramework,
        requirements: mapped
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;