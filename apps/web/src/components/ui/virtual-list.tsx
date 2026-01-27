'use client'

import { useRef, ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  estimateSize: number
  className?: string
  overscan?: number
  getItemKey?: (item: T, index: number) => string | number
}

/**
 * Virtualized list component for rendering large lists efficiently
 * Only renders visible items + overscan buffer
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimateSize,
  className,
  overscan = 5,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
    >
      <div
        style={{
          height: totalSize,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
            data-index={virtualItem.index}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Virtualized game list - optimized for game cards
 */
export function VirtualGameList<T>({
  items,
  renderItem,
  className,
  overscan = 5,
  getItemKey,
}: Omit<VirtualListProps<T>, 'estimateSize'>) {
  return (
    <VirtualList
      items={items}
      renderItem={renderItem}
      estimateSize={120} // Approximate height of a game card
      className={className}
      overscan={overscan}
      getItemKey={getItemKey}
    />
  )
}
