import React from 'react'

export default function SkeletonLoader() {
  return (
    <div className="flex w-full flex-col space-y-4 mb-5">
    <div className="flex items-center gap-4 w-full">
      {/* Circular Skeleton Icon */}
      <div className="skeleton h-24 w-24 shrink-0 rounded-full"></div>

      {/* Skeleton Text Block */}
      <div className="flex flex-col w-full">
        {/* Stretch to full width of parent container */}
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-4 w-5/6 mb-2"></div>
        <div className="skeleton h-4 w-4/6"></div>
      </div>
    </div>
  </div>
  )
}
