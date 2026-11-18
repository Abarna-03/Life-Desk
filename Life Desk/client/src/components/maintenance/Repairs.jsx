import React from 'react'
import { Plus, User, Calendar } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Repairs({ repairs, setShowAddRepairModal }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Repairs &amp; Maintenance
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track service requests, assigned technicians, breakdown history, and repair expenses.
          </p>
        </div>
        <Button type="button" onClick={() => setShowAddRepairModal(true)}>
          <Plus size={16} /> Log Service / Repair
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
        {repairs.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="mb-4 text-muted-foreground">No maintenance records found.</p>
            <Button type="button" onClick={() => setShowAddRepairModal(true)}>
              <Plus size={14} /> Log First Repair
            </Button>
          </div>
        ) : (
          repairs.map((rep) => (
            <Card
              key={rep.id}
              className="justify-between gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-100 px-5 py-3 text-[0.8125rem] font-bold text-emerald-800">
                <span>{rep.asset_name}</span>
                <Badge variant={rep.status === 'Completed' ? 'success' : 'danger'}>
                  {rep.status}
                </Badge>
              </div>
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
                  Total Cost: ${rep.total_cost || Number(rep.labor_cost || 0) + Number(rep.parts_cost || 0)}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-stone-50 px-5 py-4">
                <span className="text-[0.8rem] text-muted-foreground">
                  Labor: ${rep.labor_cost || 0} · Parts: ${rep.parts_cost || 0}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => alert(`Showing history for ${rep.asset_name}`)}
                >
                  History
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
