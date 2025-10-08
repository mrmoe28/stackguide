'use client'

import { ExternalLink, Check, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Recommendation {
  name: string
  category: string
  url: string
  description: string
  iconUrl?: string
}

interface StackCardProps {
  recommendation: Recommendation
  isSelected: boolean
  onToggle: (techName: string) => void
}

export default function StackCard({
  recommendation,
  isSelected,
  onToggle
}: StackCardProps) {
  const handleToggle = () => {
    onToggle(recommendation.name)
  }

  return (
    <Card className="p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-lg">
      <div className="flex items-start gap-3">
        {recommendation.iconUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recommendation.iconUrl}
              alt={recommendation.name}
              className="w-10 h-10 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 p-1.5 shadow-sm"
            />
            {/* Decorative glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-400/20 -z-10 blur-sm"></div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
              {recommendation.name}
            </h3>
            <a
              href={recommendation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex-shrink-0"
              title="Visit official website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 inline-block mt-1 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">
            {recommendation.category}
          </span>
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-2.5 line-clamp-3 leading-relaxed">
            {recommendation.description}
          </p>
          <Button
            onClick={handleToggle}
            size="sm"
            variant={isSelected ? 'secondary' : 'default'}
            className={`mt-3 w-full transition-all duration-200 ${
              isSelected
                ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 shadow-md shadow-green-500/30'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added to Stack
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Stack
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
