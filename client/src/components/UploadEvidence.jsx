import React, { useState } from 'react';
import axios from 'axios';

const policies = [
  { label: 'Data Encryption and Protection', value: 'POL-ENC-001' },
  { label: 'Access Control and Identity Management', value: 'POL-AC-001' },
  { label: 'Audit Logging and Monitoring', value: 'POL-AUD-001' },
];

const requirements = {
  'POL-ENC-001': [
    { label: 'All data at rest must be encrypted using AES-256', value: 'REQ-POL-ENC-001-1' },
    { label: 'Encryption keys must be rotated at least annually', value: 'REQ-POL-ENC-001-2' },
    { label: 'Data in transit must use TLS 1.2 or higher', value: 'REQ-POL-ENC-001-3' },
  ],
  'POL-AC-001': [
    { label: 'Administrative access requires MFA', value: 'REQ-POL-AC-001-1' },
    { label: 'Access must follow principle of least privilege', value: 'REQ-POL-AC-001-2' },
    { label: 'Privileged accounts must have no personal use', value: 'REQ-POL-AC-001-3' },
  ],
  'POL-AUD-001': [
    { label: 'All access to sensitive data must be logged', value: 'REQ-POL-AUD-001-1' },
    { label: 'Logs must be retained for minimum 90 days', value: 'REQ-POL-AUD-001-2' },
    { label: 'Log access must be restricted and monitored', value: 'REQ-POL-AUD-001-3' },
  ],
};

const frameworks = ['GDPR', 'NIST', 'SOX', 'PCI-DSS', 'ISO 27001', 'CIS'];

function UploadEvidence({ onUploadSuccess }) {
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [selectedRequirement, setSelectedRequirement] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpload = async () => {
    if (!selectedPolicy || !selectedRequirement || !selectedFramework || !file) {
      setMessage({ type: 'danger', text: 'Please fill all fields and select a file' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('policy', selectedPolicy);
    formData.append('requirement', selectedRequirement);
    formData.append('framework', selectedFramework);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/evidence/upload', formData);
      setMessage({ type: 'success', text: '✅ Evidence uploaded successfully!' });
      setFile(null);
      setSelectedPolicy('');
      setSelectedRequirement('');
      setSelectedFramework('');
      if (onUploadSuccess) onUploadSuccess(res.data.data);
    } catch (err) {
      setMessage({ type: 'danger', text: '❌ Upload failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="card mb-4" style={{ backgroundColor: '#1e293b', border: 'none' }}>
      <div className="card-body">
        <h5 className="text-white mb-3">📤 Add Manual Evidence for Specific Requirement</h5>

        {message && (
          <div className={`alert alert-${message.type} py-2`}>
            {message.text}
          </div>
        )}

        {/* Policy Select */}
        <div className="mb-3">
          <label className="text-secondary small mb-1">Select Policy</label>
          <select
            className="form-select bg-dark text-white border-secondary"
            value={selectedPolicy}
            onChange={e => { setSelectedPolicy(e.target.value); setSelectedRequirement(''); }}
          >
            <option value="">-- Select Policy --</option>
            {policies.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Requirement Select */}
        <div className="mb-3">
          <label className="text-secondary small mb-1">Select Requirement</label>
          <select
            className="form-select bg-dark text-white border-secondary"
            value={selectedRequirement}
            onChange={e => setSelectedRequirement(e.target.value)}
            disabled={!selectedPolicy}
          >
            <option value="">-- Select Requirement --</option>
            {(requirements[selectedPolicy] || []).map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Framework Select */}
        <div className="mb-3">
          <label className="text-secondary small mb-1">Select Framework</label>
          <select
            className="form-select bg-dark text-white border-secondary"
            value={selectedFramework}
            onChange={e => setSelectedFramework(e.target.value)}
          >
            <option value="">-- Select Framework --</option>
            {frameworks.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-3">
          <label className="text-secondary small mb-1">Upload Proof Document (PDF, Screenshot, Log file)</label>
          <input
            type="file"
            className="form-control bg-dark text-white border-secondary"
            accept=".pdf,.csv,.log,.txt,.json"
            onChange={e => setFile(e.target.files[0])}
          />
          {file && <small className="text-success mt-1 d-block">📎 {file.name}</small>}
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" />Uploading...</>
          ) : '📤 Upload Evidence'}
        </button>
      </div>
    </div>
  );
}

export default UploadEvidence;