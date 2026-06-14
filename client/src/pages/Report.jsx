import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Report() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/report')
      .then(res => {
        setReport(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const getChartData = () => {
    if (!report?.byFramework) return [];
    return Object.entries(report.byFramework).map(([name, values]) => ({
      name,
      compliant: values.compliant || 0,
      gap: values.gap || 0,
      stale: values.stale || 0,
    }));
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>

      {/* Navbar */}
      <nav className="navbar navbar-dark" style={{ backgroundColor: '#1e293b' }}>
        <div className="container">
          <span className="navbar-brand fw-bold fs-4">🛡️ ComplianceIQ</span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/')}>Home</button>
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/audit')}>Dashboard</button>
            <button className="btn btn-success btn-sm" onClick={handlePrint}>⬇️ Download Report</button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <h2 className="fw-bold mb-1">Compliance Report</h2>
        <p className="text-secondary mb-4">Generated on {new Date().toLocaleDateString()}</p>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 text-secondary">Generating report...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-primary fw-bold">{report?.summary?.total}</h3>
                    <small className="text-secondary">Total Requirements</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-success fw-bold">{report?.summary?.compliant}</h3>
                    <small className="text-secondary">Compliant</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-danger fw-bold">{report?.summary?.gap}</h3>
                    <small className="text-secondary">Gaps</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card text-center text-white h-100" style={{ backgroundColor: '#1e293b', border: 'none' }}>
                  <div className="card-body">
                    <h3 className="text-primary fw-bold">{report?.summary?.compliance_percentage}%</h3>
                    <small className="text-secondary">Compliance Rate</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card mb-4" style={{ backgroundColor: '#1e293b', border: 'none' }}>
              <div className="card-body">
                <h5 className="text-white mb-3">Compliance by Framework</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: 'white' }}
                    />
                    <Bar dataKey="compliant" fill="#22c55e" name="Compliant" />
                    <Bar dataKey="gap" fill="#ef4444" name="Gap" />
                    <Bar dataKey="stale" fill="#f59e0b" name="Stale" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Requirements Detail */}
            <div className="card" style={{ backgroundColor: '#1e293b', border: 'none' }}>
              <div className="card-body">
                <h5 className="text-white mb-3">Requirement Details</h5>
                {report?.requirements?.map((req, index) => (
                  <div key={index} className="p-3 mb-2 rounded" style={{ backgroundColor: '#0f172a' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div style={{ flex: 1, marginRight: '10px' }}>
                        <span className="text-primary fw-bold">{req.requirement_id}</span>
                        <span className="text-secondary ms-2 small">{req.policy_name}</span>
                        <p className="text-light mb-1 mt-1">{req.description}</p>
                        <small className="text-secondary d-block mb-1">
                          📋 {req.narrative}
                        </small>
                        <small className="text-secondary">
                          📅 Next Review: {req.next_review_date} |
                          🔗 Evidence: {req.evidence_links?.join(', ') || 'N/A'}
                        </small>
                      </div>
                      <div>
                        {req.status === 'compliant' && <span className="badge bg-success">✅ Compliant</span>}
                        {req.status === 'gap' && <span className="badge bg-danger">❌ Gap</span>}
                        {req.status === 'stale' && <span className="badge bg-warning text-dark">⚠️ Stale</span>}
                        {req.status === 'low_confidence' && <span className="badge bg-secondary">⚠️ Low Confidence</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Report;