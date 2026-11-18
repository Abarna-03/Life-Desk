import React from 'react';
import { DollarSign, CreditCard, Wrench } from 'lucide-react';

export default function SpendingView({
  totalAssetValue = 0,
  monthlyRecurring = 0,
  totalRepairsCost = 0,
}) {
  const chartData = [
    { month: 'Jan', maint: 0, subs: 85 },
    { month: 'Feb', maint: 140, subs: 85 },
    { month: 'Mar', maint: 65, subs: 85 },
    { month: 'Apr', maint: 0, subs: 85 },
    { month: 'May', maint: 0, subs: 85 },
    { month: 'Jun', maint: 0, subs: 85 },
    { month: 'Jul', maint: 120, subs: 85 },
    { month: 'Aug', maint: 0, subs: 85 },
    { month: 'Sep', maint: 0, subs: 85 },
    { month: 'Oct', maint: 0, subs: 85 },
    { month: 'Nov', maint: 85, subs: 540 },
    { month: 'Dec', maint: 0, subs: 85 },
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Spending</h2>
          <p className="section-subtitle">
            See where your money goes — upkeep, subscriptions and how your things hold their value.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-label">Total spent on your things</div>
            <div className="kpi-value">${totalAssetValue.toLocaleString()}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="kpi-label">Average monthly spending</div>
            <div className="kpi-value">${Math.round(monthlyRecurring)}</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber">
            <Wrench size={24} />
          </div>
          <div>
            <div className="kpi-label">Spent on repairs</div>
            <div className="kpi-value">${totalRepairsCost}</div>
          </div>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Monthly Spending Trend (Maintenance vs Subscriptions)
          </h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 12, height: 12, background: '#4f46e5', borderRadius: 2 }}></div> Maintenance &amp;
              Repairs
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 2 }}></div> Subscriptions &amp;
              AMCs
            </div>
          </div>
        </div>

        {/* Responsive Pure CSS Chart */}
        <div className="simple-bar-chart">
          {chartData.map((item, idx) => (
            <div key={idx} className="bar-column">
              <div className="bar-stack" style={{ height: `${Math.min(100, (item.maint + item.subs) / 7)}%` }}>
                <div
                  className="bar-segment-maint"
                  style={{ height: `${(item.maint / (item.maint + item.subs || 1)) * 100}%` }}
                ></div>
                <div
                  className="bar-segment-subs"
                  style={{ height: `${(item.subs / (item.maint + item.subs || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="bar-label">{item.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

