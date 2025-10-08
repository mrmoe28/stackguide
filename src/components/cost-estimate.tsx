'use client'

import { DollarSign, TrendingUp, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CostBreakdown {
  category: string
  service: string
  monthlyCost: number
  tier: string
}

interface CostEstimateProps {
  recommendations: Array<{ name: string; category: string }>
}

export default function CostEstimate({ recommendations }: CostEstimateProps) {
  // Mock cost data - will be replaced with real pricing API
  const getCostForTech = (name: string): CostBreakdown | null => {
    const costs: Record<string, CostBreakdown> = {
      'Next.js': { category: 'Framework', service: 'Next.js', monthlyCost: 0, tier: 'Free' },
      'Vercel': { category: 'Hosting', service: 'Vercel Pro', monthlyCost: 20, tier: 'Pro' },
      'PostgreSQL': { category: 'Database', service: 'Neon', monthlyCost: 19, tier: 'Scale' },
      'Neon': { category: 'Database', service: 'Neon', monthlyCost: 19, tier: 'Scale' },
      'Neon DB': { category: 'Database', service: 'Neon', monthlyCost: 19, tier: 'Scale' },
      'NeonDB': { category: 'Database', service: 'Neon', monthlyCost: 19, tier: 'Scale' },
      'Stripe': { category: 'Payments', service: 'Stripe', monthlyCost: 0, tier: 'Pay as you go' },
      'MongoDB': { category: 'Database', service: 'MongoDB Atlas', monthlyCost: 25, tier: 'M10' },
      'Firebase': { category: 'Backend', service: 'Firebase Blaze', monthlyCost: 25, tier: 'Blaze' },
      'Supabase': { category: 'Backend', service: 'Supabase Pro', monthlyCost: 25, tier: 'Pro' },
      'Prisma': { category: 'ORM', service: 'Prisma', monthlyCost: 0, tier: 'Free' },
      'Drizzle': { category: 'ORM', service: 'Drizzle ORM', monthlyCost: 0, tier: 'Free' },
      'TypeScript': { category: 'Language', service: 'TypeScript', monthlyCost: 0, tier: 'Free' },
      'Tailwind CSS': { category: 'Styling', service: 'Tailwind CSS', monthlyCost: 0, tier: 'Free' },
      'React': { category: 'Framework', service: 'React', monthlyCost: 0, tier: 'Free' },
      'Node.js': { category: 'Runtime', service: 'Node.js', monthlyCost: 0, tier: 'Free' },
      'NextAuth': { category: 'Authentication', service: 'NextAuth.js', monthlyCost: 0, tier: 'Free' },
      'Clerk': { category: 'Authentication', service: 'Clerk', monthlyCost: 25, tier: 'Pro' }
    }

    return costs[name] || null
  }

  const costBreakdown = recommendations
    .map(rec => getCostForTech(rec.name))
    .filter((cost): cost is CostBreakdown => cost !== null)

  const totalMonthlyCost = costBreakdown.reduce((sum, item) => sum + item.monthlyCost, 0)
  const annualCost = totalMonthlyCost * 12
  const paidServices = costBreakdown.filter(item => item.monthlyCost > 0).length

  if (costBreakdown.length === 0) return null

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-600 dark:bg-green-700">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cost Estimate
          </h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Based on standard pricing tiers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalMonthlyCost}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Annually</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${annualCost}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <TrendingUp className="h-4 w-4" />
            Cost Breakdown
          </div>
          <div className="space-y-2">
            {costBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.service}</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-2">({item.tier})</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.monthlyCost === 0 ? 'Free' : `$${item.monthlyCost}/mo`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <Info className="h-3 w-3 flex-shrink-0" />
          <span>
            {paidServices === 0
              ? 'All services are free to start!'
              : `${paidServices} paid service${paidServices > 1 ? 's' : ''} • Costs may vary based on usage`
            }
          </span>
        </div>
      </div>
    </Card>
  )
}
