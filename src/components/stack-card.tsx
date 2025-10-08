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
    <Card className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="flex items-start gap-3">
        {recommendation.iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recommendation.iconUrl}
            alt={recommendation.name}
            className="w-10 h-10 rounded object-contain"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {recommendation.name}
            </h3>
            <a
              href={recommendation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 inline-block mt-1">
            {recommendation.category}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
            {recommendation.description}
          </p>
          <Button
            onClick={handleToggle}
            size="sm"
            variant={isSelected ? 'secondary' : 'default'}
            className="mt-3 w-full"
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
