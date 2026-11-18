import React from 'react'
import { Plus, FileText, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { prettyType } from '@/utils/formatters'

export default function Documents({ documents, setShowAddDocModal }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Documents
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Invoices, warranty certificates, user manuals, and insurance policies organized in one place.
          </p>
        </div>
        <Button type="button" onClick={() => setShowAddDocModal(true)}>
          <Plus size={16} /> Add Document
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="mb-4 text-muted-foreground">No documents vaulted yet.</p>
            <Button type="button" onClick={() => setShowAddDocModal(true)}>
              <Plus size={14} /> Add First Document
            </Button>
          </div>
        ) : (
          documents.map((doc) => (
            <Card
              key={doc.id}
              className="justify-between gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex flex-1 items-start gap-4 p-5">
                <div className="rounded-[0.625rem] bg-primary/10 p-3.5 text-primary">
                  <FileText size={32} />
                </div>
                <div>
                  <Badge variant="info" className="mb-1.5">
                    {doc.document_type ? prettyType(doc.document_type) : 'Document'}
                  </Badge>
                  <h3 className="text-[1.05rem] font-bold">{doc.title}</h3>
                  <p className="mt-1 text-[0.85rem] text-muted-foreground">
                    Linked Asset: <strong>{doc.asset_name || 'General'}</strong>
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    File: {doc.file_name} {doc.expiry_date ? `· Expiry: ${doc.expiry_date}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-stone-50 px-5 py-4">
                <Badge variant="success">Verified</Badge>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => alert(`Opening preview for ${doc.file_name}`)}
                >
                  <ExternalLink size={13} /> View File
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
