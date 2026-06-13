const express = require('express');
const router = express.Router();
const { mapEvidenceToRequirements, parseEvidence } = require('../utils/mapper');

// Get all evidence records
router.get('/', async (req, res) => {
  try {
    const evidence = await parseEvidence();
    res.json({ success: true, data: evidence });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get mapped requirements with evidence and status
router.get('/mapped', async (req, res) => {
  try {
    const mapped = await mapEvidenceToRequirements();
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;