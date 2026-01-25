'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-hide py-2">
      <Link
        href="/"
        className="flex items-center gap-1 text-foreground-muted hover:text-neon-blue transition-colors shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-foreground-muted hover:text-neon-blue transition-colors font-display uppercase tracking-wider"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-display font-bold uppercase tracking-wider truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
