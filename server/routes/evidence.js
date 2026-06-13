const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { mapEvidenceToRequirements, parseEvidence } = require('../utils/mapper');
const Evidence = require('../models/Evidence');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../sample-data/uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

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

// Clear all uploaded evidence from MongoDB
router.get('/reset', async (req, res) => {
  try {
    await Evidence.deleteMany({});
    res.json({ success: true, message: 'All uploaded evidence cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Upload evidence file with tags
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { policy, requirement, framework } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const evidenceRecord = new Evidence({
      evidence_id: 'EVD-' + Date.now(),
      requirement_id: requirement,
      requirement_description: policy,
      framework: framework,
      evidence_type: path.extname(file.originalname).replace('.', '').toUpperCase(),
      collected_by: 'Manual Upload',
      collection_date: new Date(),
      freshness_days: 0,
      evidence_summary: `Manually uploaded file: ${file.originalname}`,
      reviewed_by: 'Pending',
      evidence_location: file.path,
      confidence_score: 0.85,
      status: 'Approved',
      anomaly_marker: ''
    });

    await evidenceRecord.save();

    res.json({ success: true, data: evidenceRecord, message: 'Evidence uploaded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;