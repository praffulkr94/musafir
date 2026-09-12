import type { ReactNode } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

/** Radix tooltip for icon-only controls. The trigger must already carry an aria-label. */
export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip" sideOffset={6} collisionPadding={8}>
          {label}
          <Tooltip.Arrow className="tooltip-arrow" width={10} height={5} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
