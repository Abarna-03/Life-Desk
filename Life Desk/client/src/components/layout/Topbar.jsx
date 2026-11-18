import React from 'react';
import { Lock, Database } from 'lucide-react';

export default function Topbar({ activeTab, currentUser, backendConnected }) {
  const firstName = (currentUser?.name || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const pageSubtitle = {
    dashboard: "Here's what needs you today.",
    assets: 'Everything you own, in one place.',
    subscriptions: 'Your plans, bills and renewals.',
    repairs: 'Repairs and maintenance history.',
    documents: 'Invoices, warranties and policies.',
    timeline: 'The full story of each item.',
    analytics: 'Where your money goes.',
  }[activeTab] || '';

  return (
    <header className="topbar">
      <div>
        <div className="topbar-greeting">
          {greeting}, {firstName} 👋
        </div>
        <div className="topbar-sub">{pageSubtitle}</div>
      </div>
      <div className="topbar-badges">
        <div className="security-pill">
          <Lock size={13} /> Private &amp; secure
        </div>
        <div className="db-pill">
          <Database size={13} /> {backendConnected ? 'All changes saved' : 'Working offline'}
        </div>
      </div>
    </header>
  );
}

