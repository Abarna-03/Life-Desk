import React from 'react'
import { Plus } from 'lucide-react'

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

export default function Subscriptions({ subscriptions, setShowAddSubModal }) {
  return (
    <div>
      <SectionHeader
        title="Subscriptions & Contracts"
        subtitle="Track recurring insurance policies, AMCs, utilities, and software services."
        action={
          <Button type="button" onClick={() => setShowAddSubModal(true)}>
            <Plus size={16} /> Add Subscription
          </Button>
        }
      />

      <CardsGrid>
        {subscriptions.length === 0 ? (
          <EmptyState
            fullWidth
            message="No subscriptions or AMCs added yet."
            action={
              <Button type="button" onClick={() => setShowAddSubModal(true)}>
                <Plus size={14} /> Add First Subscription
              </Button>
            }
          />
        ) : (
          subscriptions.map((sub) => (
            <EntityCard key={sub.id}>
              <CardTopBar tone="teal">
                <span>{sub.name}</span>
                <Badge variant="purple">{sub.category}</Badge>
              </CardTopBar>
              <div className="flex-1 p-5">
                <div className="my-2 text-[1.75rem] font-extrabold text-primary">
                  {formatMoney(sub.cost)}{' '}
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
              <CardFooterBar>
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
              </CardFooterBar>
            </EntityCard>
          ))
        )}
      </CardsGrid>
    </div>
  )
}
