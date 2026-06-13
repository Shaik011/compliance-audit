const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  evidence_id: String,
  requirement_id: String,
  requirement_description: String,
  framework: String,
  evidence_type: String,
  collected_by: String,
  collector_email: String,
  collection_date: Date,
  freshness_days: Number,
  evidence_summary: String,
  reviewed_by: String,
  reviewer_email: String,
  review_date: Date,
  evidence_location: String,
  confidence_score: Number,
  status: String,
  anomaly_marker: String,
}, { timestamps: true });

module.exports = mongoose.model('Evidence', EvidenceSchema);