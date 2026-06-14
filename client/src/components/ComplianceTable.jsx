import React from 'react';

function statusBadge(status) {
  const map = {
    compliant: { label: '✅ Compliant', className: 'badge bg-success' },
    gap: { label: '❌ Gap', className: 'badge bg-danger' },
    stale: { label: '⚠️ Stale', className: 'badge bg-warning text-dark' },
    low_confidence: { label: '⚠️ Low Confidence', className: 'badge bg-secondary' },
  };
  const s = map[status] || { label: status, className: 'badge bg-secondary' };
  return <span className={s.className}>{s.label}</span>;
}

function ComplianceTable({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-secondary">No records found.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover align-middle">
        <thead style={{ backgroundColor: '#1e293b' }}>
          <tr>
            <th>Requirement ID</th>
            <th>Policy</th>
            <th>Description</th>
            <th>Framework</th>
            <th>Status</th>
            <th>Confidence</th>
            <th>Freshness (days)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td><small className="text-primary">{row.requirement_id}</small></td>
              <td><small>{row.policy_name}</small></td>
              <td><small>{row.description}</small></td>
              <td>
                {row.compliance_mapping?.map((f, i) => (
                  <span key={i} className="badge bg-info text-dark me-1">{f}</span>
                ))}
              </td>
              <td>{statusBadge(row.status)}</td>
              <td>
                <small>
                  {row.evidence?.confidence_score
                    ? (parseFloat(row.evidence.confidence_score) * 100).toFixed(0) + '%'
                    : 'N/A'}
                </small>
              </td>
              <td>
                <small>
                  {row.evidence?.freshness_days || 'N/A'}
                </small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComplianceTable;