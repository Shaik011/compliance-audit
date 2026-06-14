import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ComplianceTable from '../components/ComplianceTable';
import Dashboard from '../components/Dashboard';
import UploadEvidence from '../components/UploadEvidence';

function Audit() {
  const navigate = useNavigate();
  const [mapped, setMapped] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [frameworkFilter, setFrameworkFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = () => {
    axios.get('http://localhost:5000/api/report')
      .then(res => {
        setMapped(res.data.data.requirements);
        setSummary(res.data.data.summary);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const frameworks = ['all', 'GDPR', 'NIST', 'SOX', 'PCI-DSS', 'ISO 27001', 'CIS'];

  const filtered = mapped.filter(r => {
    const statusMatch = statusFilter === 'all' || r.status === statusFilter;
    const frameworkMatch = frameworkFilter === 'all' ||
      r.compliance_mapping.some(c => c.toLowerCase().includes(frameworkFilter.toLowerCase()));
    const searchMatch = search === '' ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.policy_name.toLowerCase().includes(search.toLowerCase()) ||
      r.compliance_mapping.some(c => c.toLowerCase().includes(search.toLowerCase()));
    return statusMatch && frameworkMatch && searchMatch;
  });

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>

      {/* Navbar */}
      <nav className="navbar navbar-dark" style={{ backgroundColor: '#1e293b' }}>
        <div className="container">
          <span className="navbar-brand fw-bold fs-4">🛡️ ComplianceIQ</span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/')}>Home</button>
            <button className="btn btn-danger btn-sm" onClick={() => {
              if (window.confirm('Reset all uploaded evidence?')) {
                axios.get('http://localhost:5000/api/evidence/reset')
                  .then(() => {
                    alert('✅ Evidence reset successfully!');
                    fetchData();
                  });
              }
            }}>🔄 Reset Evidence</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/report')}>Generate Report</button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <h2 className="fw-bold mb-4">Audit Dashboard</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 text-secondary">Loading compliance data...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-2">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-primary fw-bold">{summary?.total}</h3>
                    <small className="text-secondary">Total</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-success fw-bold">{summary?.compliant}</h3>
                    <small className="text-secondary">Compliant</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-danger fw-bold">{summary?.gap}</h3>
                    <small className="text-secondary">Gap</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-warning fw-bold">{summary?.stale}</h3>
                    <small className="text-secondary">Stale</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-warning fw-bold">{summary?.low_confidence}</h3>
                    <small className="text-secondary">Low Confidence</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-primary fw-bold">{summary?.compliance_percentage}%</h3>
                    <small className="text-secondary">Compliance</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <Dashboard summary={summary} />

            {/* Upload Evidence */}
            <UploadEvidence onUploadSuccess={(data) => {
              alert(`✅ Evidence uploaded successfully!\n\nEvidence ID: ${data.evidence_id}\nFramework: ${data.framework}\nStatus: ${data.status}`);
              fetchData();
            }} />

            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="🔍 Search evidence... e.g. 'SOX compliance' or 'encryption'"
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="mb-2">
              <small className="text-secondary me-2">Filter by Status:</small>
              <div className="d-flex gap-2 flex-wrap mt-1">
                {['all', 'compliant', 'gap', 'stale', 'low_confidence'].map(f => (
                  <button
                    key={f}
                    className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Filter */}
            <div className="mb-3">
              <small className="text-secondary me-2">Filter by Framework:</small>
              <div className="d-flex gap-2 flex-wrap mt-1">
                {frameworks.map(f => (
                  <button
                    key={f}
                    className={`btn btn-sm ${frameworkFilter === f ? 'btn-info' : 'btn-outline-secondary'}`}
                    onClick={() => setFrameworkFilter(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <p className="text-secondary small mb-2">
              Showing {filtered.length} of {mapped.length} requirements
            </p>

            {/* Compliance Table */}
            <ComplianceTable data={filtered} />
          </>
        )}
      </div>
    </div>
  );
}

export default Audit;