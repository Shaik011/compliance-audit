import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  compliant: '#22c55e',
  gap: '#ef4444',
  stale: '#f59e0b',
  low_confidence: '#94a3b8'
};

function Dashboard({ summary }) {
  if (!summary) return null;

  const data = [
    { name: 'Compliant', value: summary.compliant },
    { name: 'Gap', value: summary.gap },
    { name: 'Stale', value: summary.stale },
    { name: 'Low Confidence', value: summary.low_confidence },
  ].filter(d => d.value > 0);

  return (
    <div className="card mb-4" style={{ backgroundColor: '#1e293b', border: 'none' }}>
      <div className="card-body">
        <h5 className="text-white mb-3">Compliance Overview</h5>
        <div className="row align-items-center">
          <div className="col-md-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[entry.name.toLowerCase().replace(' ', '_')]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="col-md-6">
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span className="text-success">✅ Compliant</span>
                <span className="text-white fw-bold">{summary.compliant}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-danger">❌ Gap</span>
                <span className="text-white fw-bold">{summary.gap}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-warning">⚠️ Stale</span>
                <span className="text-white fw-bold">{summary.stale}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">⚠️ Low Confidence</span>
                <span className="text-white fw-bold">{summary.low_confidence}</span>
              </div>
              <hr style={{ borderColor: '#334155' }} />
              <div className="d-flex justify-content-between">
                <span className="text-primary">Compliance Rate</span>
                <span className="text-primary fw-bold">{summary.compliance_percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;