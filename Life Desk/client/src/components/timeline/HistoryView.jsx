import React from 'react';
import { Calendar, FileText, CreditCard, Wrench, ShieldCheck } from 'lucide-react';
import { formatDate, prettyType } from '../../utils/formatters';

export default function HistoryView({
  selectedAsset,
  setSelectedAsset,
  assets = [],
  documents = [],
  subscriptions = [],
  repairs = [],
}) {
  if (!selectedAsset) {
    return (
      <div>
        <div className="section-header">
          <div>
            <h2 className="section-title">History</h2>
            <p className="section-subtitle">Select an item to view its complete audit history and Total Cost of Ownership.</p>
          </div>
        </div>
        <div className="empty-state">
          <p>Please select an asset to view its timeline history.</p>
          {assets.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <select
                className="filter-select"
                onChange={(e) => setSelectedAsset(assets.find((a) => a.id === e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>Choose an asset...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculations for TCO
  const selectedAssetRepairs = repairs.filter((r) => r.asset_id === selectedAsset.id);
  const selectedAssetSubs = subscriptions.filter((s) => s.asset_id === selectedAsset.id);

  const assetRepairSum = selectedAssetRepairs.reduce(
    (sum, r) => sum + (Number(r.total_cost) || Number(r.labor_cost || 0) + Number(r.parts_cost || 0)),
    0
  );
  const assetSubsSum = selectedAssetSubs.reduce((sum, s) => sum + Number(s.cost || 0), 0);
  const selectedAssetTCO = Number(selectedAsset.purchase_price || 0) + assetRepairSum + assetSubsSum;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">History</h2>
          <p className="section-subtitle">
            Everything that&apos;s happened — and the total cost so far — for <strong>{selectedAsset.name}</strong>.
          </p>
        </div>

        {/* Asset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Switch Asset:</span>
          <select
            className="filter-select"
            value={selectedAsset.id}
            onChange={(e) => setSelectedAsset(assets.find((a) => a.id === e.target.value))}
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Total Cost of Ownership (TCO) Banner */}
      <div className="timeline-tco-banner">
        <div>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Dynamic Total Cost of Ownership (TCO)
          </div>
          <div className="tco-amount">${selectedAssetTCO.toLocaleString()}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {selectedAsset.name} ({selectedAsset.brand}) · Serial: {selectedAsset.serial_number || 'N/A'}
          </div>
        </div>

        <div className="tco-breakdown">
          <div className="tco-item">
            <div className="tco-item-label">Initial Purchase</div>
            <div className="tco-item-val">${Number(selectedAsset.purchase_price || 0).toLocaleString()}</div>
          </div>
          <div className="tco-item">
            <div className="tco-item-label">Repairs &amp; Maintenance</div>
            <div className="tco-item-val">${assetRepairSum.toLocaleString()}</div>
          </div>
          <div className="tco-item">
            <div className="tco-item-label">AMCs &amp; Protection</div>
            <div className="tco-item-val">${assetSubsSum.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chronological Timeline Feed */}
      <div className="timeline-feed">
        {/* 1. Purchase Milestone */}
        <div className="timeline-item">
          <div className="timeline-dot emerald"></div>
          <div className="timeline-date">
            <Calendar size={13} /> {formatDate(selectedAsset.purchase_date) || 'Purchase date'} ·{' '}
            <span className="badge active">Purchased</span>
          </div>
          <div className="timeline-event-title">Acquired &amp; Registered: {selectedAsset.name}</div>
          <div className="timeline-event-desc">
            Purchased from {selectedAsset.store_vendor || 'Authorized Vendor'}. Initial capital expenditure.
          </div>
          <div className="timeline-cost">+ ${Number(selectedAsset.purchase_price || 0).toLocaleString()}</div>
        </div>

        {/* 2. Document Events */}
        {documents
          .filter((d) => d.asset_id === selectedAsset.id)
          .map((doc, idx) => (
            <div key={`doc-${idx}`} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-date">
                <FileText size={13} /> Document saved ·{' '}
                <span className="badge blue">{prettyType(doc.document_type)}</span>
              </div>
              <div className="timeline-event-title">{doc.title}</div>
              <div className="timeline-event-desc">File: {doc.file_name} · Safely saved to your documents.</div>
              <div className="timeline-cost" style={{ background: '#f1f5f9', color: '#475569' }}>
                Saved (No cost)
              </div>
            </div>
          ))}

        {/* 3. Subscription & Protection Plans */}
        {selectedAssetSubs.map((sub, idx) => (
          <div key={`sub-${idx}`} className="timeline-item">
            <div className="timeline-dot purple"></div>
            <div className="timeline-date">
              <CreditCard size={13} /> Contract Milestone · <span className="badge purple">{sub.category}</span>
            </div>
            <div className="timeline-event-title">{sub.name}</div>
            <div className="timeline-event-desc">
              Billed {sub.billing_cycle ? sub.billing_cycle.toLowerCase() : 'monthly'} · Next renewal:{' '}
              {formatDate(sub.next_renewal_date)}
            </div>
            <div className="timeline-cost">
              + ${sub.cost} / {sub.billing_cycle ? sub.billing_cycle.toLowerCase() : 'mo'}
            </div>
          </div>
        ))}

        {/* 4. Repair & Maintenance Milestones */}
        {selectedAssetRepairs.map((rep, idx) => (
          <div key={`rep-${idx}`} className="timeline-item">
            <div className="timeline-dot danger"></div>
            <div className="timeline-date">
              <Wrench size={13} /> {formatDate(rep.service_date) || 'Service date'} ·{' '}
              <span className="badge warning">{rep.service_type || 'Service'}</span>
            </div>
            <div className="timeline-event-title">{rep.title}</div>
            <div className="timeline-event-desc">
              Provider: {rep.service_provider_name} · Status: <strong>{rep.status}</strong>
              <br />
              Notes: {rep.technician_notes || 'Service performed as scheduled.'}
            </div>
            <div className="timeline-cost">
              + ${rep.total_cost || Number(rep.labor_cost || 0) + Number(rep.parts_cost || 0)} (Labor: $
              {rep.labor_cost || 0}, Parts: ${rep.parts_cost || 0})
            </div>
          </div>
        ))}

        {/* 5. Warranty Expiry Milestone */}
        {selectedAsset.warranty_expiry_date && (
          <div className="timeline-item">
            <div className="timeline-dot amber"></div>
            <div className="timeline-date">
              <ShieldCheck size={13} /> {formatDate(selectedAsset.warranty_expiry_date)} ·{' '}
              <span className="badge warning">Warranty ends</span>
            </div>
            <div className="timeline-event-title">Manufacturer Warranty Expiration Threshold</div>
            <div className="timeline-event-desc">
              End of standard coverage. We&apos;ll remind you 30 days and 7 days before, so your cover never lapses.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

