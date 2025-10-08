'use client'

import { useState } from 'react'
import { Share2, Download, Link as LinkIcon, Check, FileText, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExportShareProps {
  recommendations: Array<{ name: string; category: string; url: string; description: string }>
  claudePrompt?: string | null
  projectTitle?: string
}

export default function ExportShare({
  recommendations,
  claudePrompt,
  projectTitle = 'My Tech Stack'
}: ExportShareProps) {
  const [copied, setCopied] = useState(false)

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
    // In production, this would generate a shareable URL
    const shareUrl = `${window.location.origin}/share/${Date.now()}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        >
          {copied ? (
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
