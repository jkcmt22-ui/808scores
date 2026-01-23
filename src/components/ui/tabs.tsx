'use client'

import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)

  const currentValue = value ?? internalValue
  const handleValueChange = onValueChange ?? setInternalValue

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-background-secondary border-2 border-border p-1',
        className
      )}
      role="tablist"
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs()
  const isSelected = selectedValue === value

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-score-amber',
        isSelected
          ? 'bg-score-amber/20 text-score-amber border-2 border-score-amber/50'
          : 'text-foreground-muted hover:text-foreground border-2 border-transparent hover:border-border',
        className
      )}
      style={isSelected ? { textShadow: '0 0 8px var(--score-amber)' } : undefined}
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      {...props}
    />
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs()

  if (selectedValue !== value) return null

  return (
    <div
      className={cn('animate-fade-in mt-3', className)}
      role="tabpanel"
      {...props}
    />
  )
}
