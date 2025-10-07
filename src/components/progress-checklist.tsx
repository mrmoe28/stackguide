'use client'

import { useState, useEffect } from 'react'
import { Check, Circle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export interface ChecklistItem {
  id: string
  label: string
  status: 'pending' | 'in-progress' | 'completed'
  timestamp?: string
}

interface ProgressChecklistProps {
  items: ChecklistItem[]
  onItemClick?: (item: ChecklistItem) => void
  title?: string
  showTimestamps?: boolean
}

export default function ProgressChecklist({
  items,
  onItemClick,
  title = 'Progress Tracker',
  showTimestamps = false,
}: ProgressChecklistProps) {
  const [localItems, setLocalItems] = useState<ChecklistItem[]>(items)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const completedCount = localItems.filter((item) => item.status === 'completed').length
  const totalCount = localItems.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400 dark:text-gray-600" />
    }
  }

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 line-through'
      case 'in-progress':
        return 'text-blue-600 dark:text-blue-400 font-medium'
      case 'pending':
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} / {totalCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {localItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={`flex items-start gap-3 p-2 rounded transition-colors ${
              onItemClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(item.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${getStatusColor(item.status)}`}>
                {item.label}
              </p>
              {showTimestamps && item.timestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium text-center">
            ✓ All tasks completed!
          </p>
        </div>
      )}
    </Card>
  )
}
