const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  requirement_id: String,
  policy_id: String,
  policy_name: String,
  description: String,
  responsible: String,
  scope: String,
  evidence_source: String,
  audit_frequency: String,
  compliance_mapping: [String],
  status: {
    type: String,
    enum: ['compliant', 'gap', 'stale', 'low_confidence'],
    default: 'gap'
  }
}, { timestamps: true });

module.exports = mongoose.model('Requirement', RequirementSchema);