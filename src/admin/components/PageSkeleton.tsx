import React from 'react'
import { Skeleton } from '@/components/loading'

interface PageSkeletonProps {
  type?: 'table' | 'detail' | 'dashboard'
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ type = 'table' }) => {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-white border border-[#E3E7EB] rounded-xl space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-4 p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'detail') {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#E3E7EB]">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-64" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-white border border-[#E3E7EB] rounded-xl space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E3E7EB] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#E3E7EB] flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#F7F8FA] last:border-0">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
