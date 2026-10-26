import React from 'react'
import { cn } from '@/utils/cn'

export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  variant?: 'line' | 'pills'
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'line',
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'line' ? 'border-b border-[#E3E7EB]' : 'p-1 bg-[#F2F4F7] rounded-xl',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 font-medium text-sm transition-all whitespace-nowrap focus:outline-none select-none',
              variant === 'line'
                ? cn(
                    'px-4 py-2.5 -mb-px border-b-2',
                    isActive
                      ? 'border-[#28665F] text-[#28665F] font-semibold'
                      : 'border-transparent text-[#68727D] hover:text-[#20272E]'
                  )
                : cn(
                    'px-3.5 py-1.5 rounded-lg',
                    isActive
                      ? 'bg-white text-[#28665F] font-semibold shadow-xs border border-[#E3E7EB]/50'
                      : 'text-[#68727D] hover:text-[#20272E]'
                  )
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full font-medium',
                  isActive ? 'bg-[#EAF3F1] text-[#28665F]' : 'bg-[#E3E7EB] text-[#68727D]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
