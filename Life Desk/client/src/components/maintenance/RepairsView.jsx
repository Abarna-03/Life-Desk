import React from 'react';
import { Plus, User, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function RepairsView({
  repairs = [],
  setShowAddRepairModal,
}) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Repairs &amp; Maintenance</h2>
          <p className="section-subtitle">
            Log repairs, remember who fixed what, and see what you&apos;ve spent keeping things running.
          </p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddRepairModal(true)}>
          <Plus size={16} /> Log a repair
        </button>
      </div>

      {repairs.length === 0 ? (
        <div className="empty-state">
          <p>No service records logged yet. Track technician visits, costs and warranties here.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {repairs.map((rep) => (
            <div key={rep.id} className="card">
              <div className="card-top-bar green">
                <span>{rep.asset_name || 'Home Maintenance'}</span>
                <span className={`badge ${rep.status === 'Completed' ? 'active' : 'repair'}`}>
                  {rep.status}
                </span>
              </div>
              <div className="card-body">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{rep.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <User size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  <strong>Provider:</strong> {rep.service_provider_name || 'Independent Tech'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  <strong>Service date:</strong> {formatDate(rep.service_date)}
                </div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    background: '#f8fafc',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    marginBottom: '0.75rem',
                  }}
                >
                  {rep.technician_notes || 'Routine maintenance performed.'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Total Cost: ${rep.total_cost || Number(rep.labor_cost || 0) + Number(rep.parts_cost || 0)}
                </div>
              </div>
              <div className="card-footer">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Labor: ${rep.labor_cost || 0} · Parts: ${rep.parts_cost || 0}
                </span>
                <button
                  className="secondary-btn"
                  onClick={() => alert(`Showing details for ${rep.title}`)}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

