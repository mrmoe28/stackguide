'use client'

import { useState } from 'react'
import { Share2, Download, Link as LinkIcon, Check, FileText, Code, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from 'next-auth/react'

interface ExportShareProps {
  recommendations: Array<{ name: string; category: string; url: string; description: string; iconUrl?: string }>
  claudePrompt?: string | null
  projectTitle?: string
  projectDescription?: string
  projectId?: string
}

export default function ExportShare({
  recommendations,
  claudePrompt,
  projectTitle = 'My Tech Stack',
  projectDescription,
  projectId,
}: ExportShareProps) {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  const generateMarkdown = () => {
    let markdown = `# ${projectTitle}\n\n`
    markdown += `## Recommended Stack\n\n`

    const categories = [...new Set(recommendations.map(r => r.category))]
    categories.forEach(category => {
      markdown += `### ${category}\n\n`
      const items = recommendations.filter(r => r.category === category)
      items.forEach(item => {
        markdown += `- **[${item.name}](${item.url})** - ${item.description}\n`
      })
      markdown += `\n`
    })

    if (claudePrompt) {
      markdown += `## Implementation Prompt\n\n\`\`\`\n${claudePrompt}\n\`\`\`\n`
    }

    return markdown
  }

  const generateJSON = () => {
    return JSON.stringify({
      project: projectTitle,
      recommendations,
      claudePrompt,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  const handleExportMarkdown = () => {
    const markdown = generateMarkdown()
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-')}-stack.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    const json = generateJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-')}-stack.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyLink = async () => {
    try {
      setSharing(true)

      // Call API to create share link
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle,
          projectDescription,
          recommendations,
          claudePrompt,
          projectId,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create share link')
      }

      const data = await response.json()

      // Copy the real share URL to clipboard
      await navigator.clipboard.writeText(data.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error creating share link:', error)
      alert('Failed to create share link. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  const handleCopyMarkdown = async () => {
    const markdown = generateMarkdown()
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (recommendations.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          disabled={sharing}
        >
          {sharing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating link...
            </>
          ) : copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 mr-2" />
              Export & Share
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
          Share Options
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopyLink}>
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>Copy Share Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyMarkdown}>
          <Code className="mr-2 h-4 w-4" />
          <span>Copy as Markdown</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
          Export Files
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleExportMarkdown}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Download Markdown</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download JSON</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
