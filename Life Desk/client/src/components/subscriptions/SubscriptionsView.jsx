import React from 'react';
import { Plus } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function SubscriptionsView({
  subscriptions = [],
  setShowAddSubModal,
}) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Subscriptions &amp; Renewals</h2>
          <p className="section-subtitle">Keep an eye on insurance, AMCs, utilities and apps — and never miss a renewal.</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddSubModal(true)}>
          <Plus size={16} /> Add a subscription
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <p>No subscriptions or protection plans recorded yet. Click &quot;Add a subscription&quot; to stay on top of renewals.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="card">
              <div className="card-top-bar blue">
                <span>{sub.name}</span>
                <span className="badge purple">{sub.category}</span>
              </div>
              <div className="card-body">
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0' }}>
                  ${sub.cost}{' '}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    /{sub.billing_cycle ? sub.billing_cycle.toLowerCase() : 'mo'}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <strong>For:</strong> {sub.asset_name || 'Your whole home'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
                  Next renewal: <strong>{formatDate(sub.next_renewal_date)}</strong>
                </div>
              </div>
              <div className="card-footer">
                <span className={`badge ${sub.auto_renew ? 'active' : 'warning'}`}>
                  {sub.auto_renew ? 'Auto-Renew: ON' : 'Manual Payment'}
                </span>
                <button
                  className="secondary-btn"
                  onClick={() => alert(`Marked ${sub.name} for reminder notifications.`)}
                >
                  Set Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

