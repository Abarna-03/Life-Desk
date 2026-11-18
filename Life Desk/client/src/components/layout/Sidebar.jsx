import React from 'react';
import { Layers, Home, CreditCard, Wrench, FileText, Clock, BarChart2, ExternalLink } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  assetsCount = 0,
  subscriptionsCount = 0,
  repairsCount = 0,
  documentsCount = 0,
  currentUser,
  onLogout,
}) {
  const navItems = [
    { key: 'dashboard', label: 'Home', icon: Layers },
    { key: 'assets', label: 'My Belongings', icon: Home, count: assetsCount },
    { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptionsCount },
    { key: 'repairs', label: 'Repairs', icon: Wrench, count: repairsCount },
    { key: 'documents', label: 'Documents', icon: FileText, count: documentsCount },
    { key: 'timeline', label: 'History', icon: Clock },
    { key: 'analytics', label: 'Spending', icon: BarChart2 },
  ];

  const initials = (currentUser?.name || currentUser?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Layers size={20} />
        </div>
        <div>
          <div className="brand-title">LifeHub</div>
          <div className="brand-tagline">Home, organized</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`side-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <Icon size={18} />
              <span className="side-link-label">{item.label}</span>
              {item.count != null && <span className="side-count">{item.count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser?.name || 'You'}</div>
            <div className="sidebar-user-email">{currentUser?.email}</div>
          </div>
        </div>
        <button type="button" className="logout-btn full" onClick={onLogout} title="Sign out">
          <ExternalLink size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

