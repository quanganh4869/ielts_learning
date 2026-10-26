import React from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'muted' | 'interactive' | 'selected'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', variant = 'default', children, ...props }, ref) => {
    const paddings = {
      none: 'p-0',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-6',
    }

    const variants = {
      default: 'bg-white border border-[#E3E7EB] text-[#20272E]',
      muted: 'bg-[#F7F8FA] border border-[#E3E7EB] text-[#20272E]',
      interactive:
        'bg-white border border-[#E3E7EB] text-[#20272E] hover:border-[#CBD5E1] transition-colors cursor-pointer',
      selected: 'bg-[#EAF3F1] border border-[#28665F] text-[#20272E]',
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-xl transition-all', paddings[padding], variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
