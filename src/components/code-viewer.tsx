'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CodeFile {
  path: string
  content: string
  language: string
}

interface CodeViewerProps {
  files: CodeFile[]
  projectName: string
  setup: string[]
}

export default function CodeViewer({ files, projectName, setup }: CodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(files[selectedFile].content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadAll = () => {
    // Create a text file with all files
    let allContent = `# ${projectName}\n\n`
    files.forEach(file => {
      allContent += `\n## ${file.path}\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n`
    })

    const blob = new Blob([allContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}-boilerplate.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📦 Starter Code
        </h3>
        <Button
          onClick={handleDownloadAll}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      {/* File Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setSelectedFile(index)}
            className={`px-3 py-1 text-sm font-mono rounded-t whitespace-nowrap transition-colors ${
              selectedFile === index
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {file.path}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="relative">
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 z-10 gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
        <div className="rounded overflow-hidden max-h-[400px] overflow-y-auto">
          <SyntaxHighlighter
            language={files[selectedFile].language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {files[selectedFile].content}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Setup Instructions */}
      {setup && setup.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            🚀 Setup Instructions:
          </h4>
          <ol className="list-decimal list-inside space-y-1">
            {setup.map((step, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  )
}
