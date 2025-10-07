'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Download, FolderOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FileAccessConsentDialog from '@/components/file-access-consent-dialog'
import ProgressChecklist, { ChecklistItem } from '@/components/progress-checklist'

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
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSaveToFolder = () => {
    setShowConsentDialog(true)
  }

  const handleConsentAccept = async () => {
    setShowConsentDialog(false)
    setShowProgress(true)
    setIsSaving(true)

    // Initialize checklist
    const items: ChecklistItem[] = files.map((file, index) => ({
      id: `file-${index}`,
      label: `Create ${file.path}`,
      status: 'pending' as const,
    }))
    setChecklistItems(items)

    try {
      // Check browser support
      if (!('showDirectoryPicker' in window)) {
        alert(
          'Your browser does not support the File System Access API. Please use Chrome, Edge, Opera, or Brave.'
        )
        setShowProgress(false)
        setIsSaving(false)
        return
      }

      // Request directory access
      const dirHandle = await (window as unknown as { showDirectoryPicker: (options: { mode: string }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({
        mode: 'readwrite',
      })

      // Create project folder
      const projectDirHandle = await dirHandle.getDirectoryHandle(projectName, {
        create: true,
      })

      // Save each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Update status to in-progress
        setChecklistItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'in-progress' as const } : item
          )
        )

        // Create subdirectories if needed
        const pathParts = file.path.split('/')
        let currentDir = projectDirHandle

        for (let j = 0; j < pathParts.length - 1; j++) {
          currentDir = await currentDir.getDirectoryHandle(pathParts[j], {
            create: true,
          })
        }

        // Write file
        const fileName = pathParts[pathParts.length - 1]
        const fileHandle = await currentDir.getFileHandle(fileName, {
          create: true,
        })
        const writable = await fileHandle.createWritable()
        await writable.write(file.content)
        await writable.close()

        // Update status to completed
        setChecklistItems((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? { ...item, status: 'completed' as const, timestamp: new Date().toISOString() }
              : item
          )
        )

        // Small delay for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Add README with setup instructions if not already included
      const hasReadme = files.some(f => f.path.toLowerCase().includes('readme'))
      if (!hasReadme && setup && setup.length > 0) {
        const readmeContent = `# ${projectName}\n\n## Setup Instructions\n\n${setup.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`
        const readmeHandle = await projectDirHandle.getFileHandle('SETUP.md', {
          create: true,
        })
        const writable = await readmeHandle.createWritable()
        await writable.write(readmeContent)
        await writable.close()
      }

      alert(`✅ Project "${projectName}" created successfully!`)
    } catch (error) {
      console.error('Error saving files:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          alert('Folder selection was cancelled.')
        } else {
          alert(`Error creating project: ${error.message}`)
        }
      } else {
        alert('An unexpected error occurred while creating the project.')
      }
    } finally {
      setIsSaving(false)
      setTimeout(() => {
        setShowProgress(false)
      }, 2000)
    }
  }

  const handleConsentDecline = () => {
    setShowConsentDialog(false)
  }

  return (
    <>
      <FileAccessConsentDialog
        projectName={projectName}
        fileCount={files.length}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
        isOpen={showConsentDialog}
      />

      {showProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <ProgressChecklist
              items={checklistItems}
              title={`Creating ${projectName}`}
              showTimestamps={false}
            />
          </div>
        </div>
      )}

      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📦 Starter Code
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveToFolder}
              size="sm"
              variant="default"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              <FolderOpen className="h-4 w-4" />
              Save to Folder
            </Button>
            <Button
              onClick={handleDownloadAll}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

      {/* File Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setSelectedFile(index)}
            className={`px-3 py-2 text-sm font-mono rounded-t whitespace-nowrap transition-all duration-200 ${
              selectedFile === index
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-t-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
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
            language={String(files[selectedFile].language || 'text')}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {String(files[selectedFile].content || '')}
          </SyntaxHighlighter>
        </div>
      </div>

        {/* Setup Instructions - Beginner Friendly */}
        {setup && setup.length > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-xl">
                🚀
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Getting Started - Step by Step
              </h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Follow these instructions carefully. Each step is explained in detail to help you get your project running smoothly!
            </p>
            <ol className="space-y-4">
              {setup.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                💡 <strong>Need help?</strong> If you get stuck, don&apos;t worry! Most issues can be solved by making sure you&apos;re in the right folder and that Node.js is installed on your computer.
              </p>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
