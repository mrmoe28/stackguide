'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, FolderKanban, Lightbulb, Database, Loader2 } from 'lucide-react'
import type { Knowledge } from '@/lib/db'

interface AdminDashboardProps {
  stats: {
    users: number
    projects: number
    recommendations: number
    knowledge: number
  }
  knowledgeEntries: Knowledge[]
}

export default function AdminDashboard({
  stats,
  knowledgeEntries,
}: AdminDashboardProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleScrapeRepo = async () => {
    if (!repoUrl.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Successfully scraped: ${data.data.title}`)
        setRepoUrl('')
      } else {
        setMessage(`✗ Error: ${data.error}`)
      }
    } catch {
      setMessage('✗ Failed to scrape repository')
    } finally {
      setLoading(false)
    }
  }

  const handleScrapeTopic = async () => {
    if (!topic.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, limit: 10 }),
      })

      const data = await response.json()

      if (response.ok) {
        const successful = data.results.filter(
          (r: { success: boolean }) => r.success
        ).length
        setMessage(
          `✓ Scraped ${successful}/${data.results.length} repositories`
        )
        setTopic('')
      } else {
        setMessage(`✗ Error: ${data.error}`)
      }
    } catch {
      setMessage('✗ Failed to scrape topic')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.users}
              </p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Projects
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.projects}
              </p>
            </div>
            <FolderKanban className="h-10 w-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recommendations
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.recommendations}
              </p>
            </div>
            <Lightbulb className="h-10 w-10 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Knowledge Base
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.knowledge}
              </p>
            </div>
            <Database className="h-10 w-10 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Scraper Controls */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          GitHub Scraper
        </h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleScrapeRepo} disabled={loading || !repoUrl}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Scrape Repo'
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Topic (e.g., react, typescript, nodejs)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleScrapeTopic} disabled={loading || !topic}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Scrape Topic'
              )}
            </Button>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.startsWith('✓')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </Card>

      {/* Knowledge Entries Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Knowledge Entries
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Language
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tags
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {knowledgeEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-4">
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {entry.title}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {entry.category || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {entry.language || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {entry.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
