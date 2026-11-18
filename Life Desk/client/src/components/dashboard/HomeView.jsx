import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Wrench,
  Plus,
  Calendar,
  Clock,
} from 'lucide-react';

export default function HomeView({
  attention = [],
  totalAssetValue = 0,
  monthlyRecurring = 0,
  totalRepairsCost = 0,
  assets = [],
  tasks = [],
  setActiveTab,
  setSelectedAsset,
  setShowAddTaskModal,
  setShowAddAssetModal,
}) {
  return (
    <div>
      {/* ===== Needs your attention (leads the page) ===== */}
      <section className="attention-panel">
        <div className="attention-head">
          <div className="attention-head-left">
            <div className={`attention-badge ${attention.length ? 'warn' : 'ok'}`}>
              {attention.length ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            </div>
            <div>
              <h2 className="attention-title">
                {attention.length
                  ? `${attention.length} ${attention.length === 1 ? 'thing needs' : 'things need'} your attention`
                  : "You're all caught up"}
              </h2>
              <p className="attention-sub">
                {attention.length
                  ? 'Warranties ending, renewals due and open repairs.'
                  : 'Nothing needs you in the next 30 days. Nice.'}
              </p>
            </div>
          </div>
        </div>

        {attention.length > 0 && (
          <div className="attention-list">
            {attention.slice(0, 5).map((item, idx) => {
              const Icon = item.icon;
              return (
                <button key={idx} className="attention-item" onClick={() => setActiveTab(item.tab)}>
                  <div className={`attention-item-icon ${item.tone}`}>
                    <Icon size={16} />
                  </div>
                  <div className="attention-item-body">
                    <div className="attention-item-title">{item.title}</div>
                    <div className="attention-item-detail">{item.detail}</div>
                  </div>
                  <span className={`chip ${item.tone}`}>{item.type}</span>
                  <ArrowRight size={16} className="attention-item-arrow" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== At a glance ===== */}
      <h3 className="block-heading">At a glance</h3>
      {/* Financial KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-label">What your things are worth</div>
            <div className="kpi-value">${totalAssetValue.toLocaleString()}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="kpi-label">Monthly spending</div>
            <div className="kpi-value">${Math.round(monthlyRecurring)}/mo</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon emerald">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="kpi-label">Protected items</div>
            <div className="kpi-value">{assets.filter((a) => a.status === 'Active').length} Active</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber">
            <Wrench size={24} />
          </div>
          <div>
            <div className="kpi-label">Spent on upkeep this year</div>
            <div className="kpi-value">${totalRepairsCost}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Tasks & Quick Asset Registry */}
      <div className="dash-columns">
        {/* Left Column: Upcoming Actions */}
        <div>
          <div className="section-header">
            <div>
              <h3 className="section-title">Upcoming Actions &amp; Tasks</h3>
              <p className="section-subtitle">Maintenance schedules, filter replacements, and life tasks</p>
            </div>
            <button className="secondary-btn" onClick={() => setShowAddTaskModal(true)}>
              <Plus size={14} /> Add Task
            </button>
          </div>

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={22} />
                <p>No tasks yet. Add a reminder for upkeep or errands.</p>
              </div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="task-item">
                  <div>
                    <div className="task-room">{t.room}</div>
                    <div className="task-title">{t.title}</div>
                    <div className="task-due">
                      <Calendar size={13} /> {t.due}
                    </div>
                  </div>
                  <span className={`badge ${t.priority === 'Urgent' ? 'repair' : 'active'}`}>{t.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Key Assets Quick View */}
        <div>
          <div className="section-header">
            <div>
              <h3 className="section-title">Your belongings</h3>
              <p className="section-subtitle">Your most valuable items</p>
            </div>
            <button className="primary-btn" onClick={() => setShowAddAssetModal(true)}>
              <Plus size={14} /> Add Asset
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {assets.length === 0 ? (
              <div className="empty-state">
                <p>No belongings added yet. Click &quot;Add Asset&quot; to begin tracking.</p>
              </div>
            ) : (
              assets.slice(0, 3).map((asset) => (
                <div key={asset.id} className="card" style={{ padding: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span className="badge blue">{asset.category}</span>
                    <span className="badge active">{asset.location_room}</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{asset.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem 0' }}>
                    Brand: {asset.brand || 'N/A'} · Model: {asset.model_number || 'N/A'}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ${Number(asset.purchase_price).toLocaleString()}
                    </div>
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setActiveTab('timeline');
                      }}
                    >
                      <Clock size={14} /> View history
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

