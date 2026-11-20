import React from 'react'
import { Plus, User, Calendar, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CardFooterBar,
  CardsGrid,
  CardTopBar,
  EmptyState,
  EntityCard,
  SectionHeader,
} from '@/components/common'
import { formatMoney } from '@/utils/formatters'

export default function Repairs({ repairs, setShowAddRepairModal, onEditRepair, onDeleteRepair }) {
  return (
    <div>
      <SectionHeader
        title="Repairs & Maintenance"
        subtitle="Track service requests, assigned technicians, breakdown history, and repair expenses."
        action={
          <Button type="button" onClick={() => setShowAddRepairModal(true)}>
            <Plus size={16} /> Log Service / Repair
          </Button>
        }
      />

      <CardsGrid>
        {repairs.length === 0 ? (
          <EmptyState
            fullWidth
            message="No maintenance records found."
            action={
              <Button type="button" onClick={() => setShowAddRepairModal(true)}>
                <Plus size={14} /> Log First Repair
              </Button>
            }
          />
        ) : (
          repairs.map((rep) => (
            <EntityCard key={rep.id}>
              <CardTopBar tone="green">
                <span>{rep.asset_name}</span>
                <Badge variant={rep.status === 'Completed' ? 'success' : 'danger'}>
                  {rep.status}
                </Badge>
              </CardTopBar>
              <div className="flex-1 p-5">
                <h3 className="mb-2 text-[1.1rem] font-bold">{rep.title}</h3>
                <div className="mb-2 flex items-center gap-1.5 text-[0.85rem] text-muted-foreground">
                  <User size={13} />
                  <span>
                    <strong>Provider:</strong> {rep.service_provider_name || 'Independent Specialist'}
                  </span>
                </div>
                <div className="mb-3 flex items-center gap-1.5 text-[0.85rem] text-muted-foreground">
                  <Calendar size={13} />
                  <span>
                    <strong>Service Date:</strong> {rep.service_date || 'Scheduled'}
                  </span>
                </div>
                <div className="mb-3 rounded-lg border border-border bg-muted px-3 py-2 text-[0.8125rem]">
                  {rep.technician_notes || 'Routine maintenance performed.'}
                </div>
                <div className="text-[1.25rem] font-extrabold text-primary">
                  Total Cost: {formatMoney(rep.total_cost || Number(rep.labor_cost || 0) + Number(rep.parts_cost || 0))}
                </div>
              </div>
              <CardFooterBar>
                <span className="text-[0.8rem] text-muted-foreground">
                  Labor: {formatMoney(rep.labor_cost || 0)} · Parts: {formatMoney(rep.parts_cost || 0)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditRepair(rep)}
                  >
                    <Pencil size={13} /> Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDeleteRepair(rep)}
                    aria-label="Delete repair"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </CardFooterBar>
            </EntityCard>
          ))
        )}
      </CardsGrid>
    </div>
  )
}
