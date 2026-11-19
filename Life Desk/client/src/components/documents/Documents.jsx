import React from 'react'
import { Plus, FileText, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CardFooterBar,
  CardsGrid,
  EmptyState,
  EntityCard,
  SectionHeader,
} from '@/components/common'
import { prettyType } from '@/utils/formatters'

export default function Documents({ documents, setShowAddDocModal }) {
  return (
    <div>
      <SectionHeader
        title="Documents"
        subtitle="Invoices, warranty certificates, user manuals, and insurance policies organized in one place."
        action={
          <Button type="button" onClick={() => setShowAddDocModal(true)}>
            <Plus size={16} /> Add Document
          </Button>
        }
      />

      <CardsGrid>
        {documents.length === 0 ? (
          <EmptyState
            fullWidth
            message="No documents vaulted yet."
            action={
              <Button type="button" onClick={() => setShowAddDocModal(true)}>
                <Plus size={14} /> Add First Document
              </Button>
            }
          />
        ) : (
          documents.map((doc) => (
            <EntityCard key={doc.id}>
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
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    File: {doc.file_name} {doc.expiry_date ? `· Expiry: ${doc.expiry_date}` : ''}
                  </p>
                </div>
              </div>
              <CardFooterBar>
                <Badge variant="success">Verified</Badge>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => alert(`Opening preview for ${doc.file_name}`)}
                >
                  <ExternalLink size={13} /> View File
                </Button>
              </CardFooterBar>
            </EntityCard>
          ))
        )}
      </CardsGrid>
    </div>
  )
}
