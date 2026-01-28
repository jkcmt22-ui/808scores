'use client'

import { createContext, useContext, useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  tabValues: string[]
  registerTab: (value: string) => void
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
  const [tabValues, setTabValues] = useState<string[]>([])

  const currentValue = value ?? internalValue
  const handleValueChange = onValueChange ?? setInternalValue

  const registerTab = useCallback((tabValue: string) => {
    setTabValues((prev) => {
      if (prev.includes(tabValue)) return prev
      return [...prev, tabValue]
    })
  }, [])

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, tabValues, registerTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string
}

export function TabsList({ className, children, 'aria-label': ariaLabel, ...props }: TabsListProps) {
  const { value: selectedValue, onValueChange, tabValues } = useTabs()
  const tabListRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation (arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabValues.indexOf(selectedValue)
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        newIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = tabValues.length - 1
        break
      default:
        return
    }

    if (newIndex !== currentIndex && tabValues[newIndex]) {
      onValueChange(tabValues[newIndex])
      // Focus the new tab
      const tabs = tabListRef.current?.querySelectorAll('[role="tab"]')
      const newTab = tabs?.[newIndex] as HTMLElement | undefined
      newTab?.focus()
    }
  }

  return (
    <div
      ref={tabListRef}
      className={cn(
        'inline-flex items-center gap-1 bg-background-secondary border-2 border-border p-1',
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ className, value, id, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, registerTab } = useTabs()
  const isSelected = selectedValue === value
  const tabId = id || `tab-${value}`
  const panelId = `tabpanel-${value}`

  // Register this tab value on mount
  useState(() => {
    registerTab(value)
  })

  return (
    <button
      id={tabId}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-score-amber focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        isSelected
          ? 'bg-score-amber/20 text-score-amber border-2 border-score-amber/50'
          : 'text-foreground-muted hover:text-foreground border-2 border-transparent hover:border-border',
        className
      )}
      style={isSelected ? { textShadow: '0 0 8px var(--score-amber)' } : undefined}
      role="tab"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => onValueChange(value)}
      {...props}
    />
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ className, value, id, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs()
  const isSelected = selectedValue === value
  const panelId = id || `tabpanel-${value}`
  const tabId = `tab-${value}`

  if (!isSelected) return null

  return (
    <div
      id={panelId}
      className={cn('animate-fade-in mt-3', className)}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      {...props}
    />
  )
}
