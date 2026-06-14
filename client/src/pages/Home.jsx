import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [policyFile, setPolicyFile] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!policyFile || !evidenceFile) {
      setError('Please upload both files');
      return;
    }

    const formData = new FormData();
    formData.append('policy', policyFile);
    formData.append('evidence', evidenceFile);

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/evidence/upload-files', formData);
      navigate('/audit');
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>

      {/* Navbar */}
      <nav className="navbar navbar-dark" style={{ backgroundColor: '#1e293b' }}>
        <div className="container">
          <span className="navbar-brand fw-bold fs-4">🛡️ ComplianceIQ</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="container text-center py-5">
        <h1 className="display-4 fw-bold text-primary mb-3">🛡️ ComplianceIQ</h1>
        <p className="lead text-secondary mb-2">
          Automated Compliance Evidence Collection & Audit Platform
        </p>
        <p className="text-light mx-auto mb-4" style={{ maxWidth: '600px' }}>
          Stop spending 72+ hours per audit cycle manually gathering evidence.
          ComplianceIQ automatically maps evidence to compliance requirements
          across GDPR, SOX, NIST, PCI-DSS, ISO 27001 and CIS.
        </p>
      </div>

      {/* Upload Section */}
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card" style={{ backgroundColor: '#1e293b', border: 'none' }}>
              <div className="card-body p-4">
                <h5 className="text-white mb-4">📂 Upload Your Files to Get Started</h5>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                {/* Policy File */}
                <div className="mb-3">
                  <label className="text-secondary small mb-1">
                    📄 Policy Document (.txt)
                  </label>
                  <input
                    type="file"
                    className="form-control bg-dark text-white border-secondary"
                    accept=".txt"
                    onChange={e => setPolicyFile(e.target.files[0])}
                  />
                  {policyFile && <small className="text-success mt-1 d-block">✅ {policyFile.name}</small>}
                </div>

                {/* Evidence File */}
                <div className="mb-4">
                  <label className="text-secondary small mb-1">
                    📊 Evidence Artifacts (.csv)
                  </label>
                  <input
                    type="file"
                    className="form-control bg-dark text-white border-secondary"
                    accept=".csv"
                    onChange={e => setEvidenceFile(e.target.files[0])}
                  />
                  {evidenceFile && <small className="text-success mt-1 d-block">✅ {evidenceFile.name}</small>}
                </div>

                <button
                  className="btn btn-primary w-100 btn-lg"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                  ) : '🚀 Analyze Compliance'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-4 justify-content-center mt-4">
          <div className="col-6 col-md-3">
            <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
              <div className="card-body">
                <h2 className="text-primary fw-bold">500+</h2>
                <p className="text-secondary mb-0">Evidence Records</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
              <div className="card-body">
                <h2 className="text-primary fw-bold">6</h2>
                <p className="text-secondary mb-0">Compliance Frameworks</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
              <div className="card-body">
                <h2 className="text-primary fw-bold">72hrs → 15min</h2>
                <p className="text-secondary mb-0">Audit Time Reduced</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
              <div className="card-body">
                <h2 className="text-primary fw-bold">Auto</h2>
                <p className="text-secondary mb-0">Evidence Mapping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;