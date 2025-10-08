import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { sharedRecommendations } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

interface RecommendationItem {
  name: string
  category: string
  url: string
  description: string
  iconUrl?: string
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  const [share] = await db
    .select()
    .from(sharedRecommendations)
    .where(eq(sharedRecommendations.id, id))
    .limit(1)

  if (!share) {
    return {
      title: 'Share Not Found',
    }
  }

  return {
    title: `${share.projectTitle} - Tech Stack`,
    description: share.projectDescription || `Recommended technology stack for ${share.projectTitle}`,
    openGraph: {
      title: `${share.projectTitle} - Tech Stack`,
      description: share.projectDescription || `Recommended technology stack for ${share.projectTitle}`,
      type: 'website',
    },
  }
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params

  // Fetch shared recommendation
  const [share] = await db
    .select()
    .from(sharedRecommendations)
    .where(eq(sharedRecommendations.id, id))
    .limit(1)

  if (!share) {
    notFound()
  }

  // Increment view count
  await db
    .update(sharedRecommendations)
    .set({
      viewCount: sql`${sharedRecommendations.viewCount} + 1`,
    })
    .where(eq(sharedRecommendations.id, id))

  // Type cast and group recommendations by category
  const recommendations = share.recommendations as unknown as RecommendationItem[]
  const categories = [...new Set(recommendations.map(r => r.category))]
  const recommendationsByCategory = categories.map(category => ({
    category,
    items: recommendations.filter(r => r.category === category),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/landing">
              <Button variant="ghost" size="sm">
                ← Back to StackGuideR
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{share.viewCount} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(share.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {share.projectTitle}
          </h1>
          {share.projectDescription && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {share.projectDescription}
            </p>
          )}
        </div>

        {/* Recommendations Grid */}
        <div className="space-y-8 mb-8">
          {recommendationsByCategory.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-base">
                  {category}
                </Badge>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((rec, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {rec.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {rec.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          Learn More
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Claude Prompt Section */}
        {share.claudePrompt && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Implementation Prompt</CardTitle>
              <CardDescription>
                Use this prompt with Claude to start building your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{share.claudePrompt}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center py-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold mb-2">
            Get personalized tech stack recommendations
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your own AI-powered recommendations with StackGuideR
          </p>
          <Button asChild size="lg">
            <Link href="/auth/signup">
              Get Started Free
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
