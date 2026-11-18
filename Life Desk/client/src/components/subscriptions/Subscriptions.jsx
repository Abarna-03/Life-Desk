import React from 'react'
import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Subscriptions({ subscriptions, setShowAddSubModal }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            Subscriptions &amp; Contracts
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track recurring insurance policies, AMCs, utilities, and software services.
          </p>
        </div>
        <Button type="button" onClick={() => setShowAddSubModal(true)}>
          <Plus size={16} /> Add Subscription
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
        {subscriptions.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="mb-4 text-muted-foreground">No subscriptions or AMCs added yet.</p>
            <Button type="button" onClick={() => setShowAddSubModal(true)}>
              <Plus size={14} /> Add First Subscription
            </Button>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <Card
              key={sub.id}
              className="justify-between gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-teal-200 bg-teal-50 px-5 py-3 text-[0.8125rem] font-bold text-teal-800">
                <span>{sub.name}</span>
                <Badge variant="purple">{sub.category}</Badge>
              </div>
              <div className="flex-1 p-5">
                <div className="my-2 text-[1.75rem] font-extrabold text-primary">
                  ${sub.cost}{' '}
                  <span className="text-sm font-medium text-muted-foreground">
                    /{sub.billing_cycle.toLowerCase()}
                  </span>
                </div>
                <div className="mb-2 text-sm text-muted-foreground">
                  <strong>Linked Asset:</strong> {sub.asset_name || 'Home-Wide'}
                </div>
                <div className="text-[0.85rem] font-semibold text-amber-700">
                  Next Renewal: <strong>{sub.next_renewal_date}</strong>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-stone-50 px-5 py-4">
                <Badge variant={sub.auto_renew ? 'success' : 'warning'}>
                  {sub.auto_renew ? 'Auto-Renew: ON' : 'Manual Payment'}
                </Badge>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => alert(`Marked ${sub.name} for reminder notifications.`)}
                >
                  Set Reminder
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
