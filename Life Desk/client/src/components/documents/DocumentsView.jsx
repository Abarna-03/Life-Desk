import React from 'react';
import { Plus, FileText, ExternalLink } from 'lucide-react';
import { formatDate, prettyType } from '../../utils/formatters';

export default function DocumentsView({
  documents = [],
  setShowAddDocModal,
}) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Documents</h2>
          <p className="section-subtitle">
            Invoices, warranty cards, manuals and insurance papers — safely organized in one place.
          </p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddDocModal(true)}>
          <Plus size={16} /> Add a document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents uploaded yet. Upload receipts, invoices, and manuals for safe keeping.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="card">
              <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    background: 'var(--primary-light)',
                    padding: '0.875rem',
                    borderRadius: '0.625rem',
                    color: 'var(--primary)',
                  }}
                >
                  <FileText size={32} />
                </div>
                <div>
                  <span className="badge blue" style={{ marginBottom: '0.35rem' }}>
                    {prettyType(doc.document_type)}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{doc.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    For: <strong>{doc.asset_name || 'General Household'}</strong>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    File: {doc.file_name} {doc.expiry_date ? `· Expires ${formatDate(doc.expiry_date)}` : ''}
                  </p>
                </div>
              </div>
              <div className="card-footer">
                <span className="badge active">Verified</span>
                <button
                  className="secondary-btn"
                  onClick={() => alert(`Opening preview for ${doc.file_name}`)}
                >
                  <ExternalLink size={13} /> View File
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

