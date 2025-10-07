'use client'

import { useState } from 'react'
import { FolderOpen, AlertCircle, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface FileAccessConsentDialogProps {
  projectName: string
  fileCount: number
  onAccept: () => void
  onDecline: () => void
  isOpen: boolean
}

export default function FileAccessConsentDialog({
  projectName,
  fileCount,
  onAccept,
  onDecline,
  isOpen,
}: FileAccessConsentDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <FolderOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Save Project to Your Computer
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              StackGuideR would like to create <strong>{projectName}</strong> on your local
              file system.
            </p>
          </div>
        </div>

        {/* What will be created */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              What will be created:
            </h3>
          </div>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-7">
            <li>• {fileCount} project files</li>
            <li>• Organized folder structure</li>
            <li>• Ready-to-run code with dependencies</li>
            <li>• Setup instructions (README.md)</li>
          </ul>
        </div>

        {/* Privacy notice */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Privacy Notice:</strong> Your browser will prompt you to select a folder.
            StackGuideR only has access to write files in the folder you choose. No data is
            sent to our servers.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1 gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            Choose Folder
          </Button>
        </div>

        {/* Browser support notice */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-500">
          Supported on Chrome, Edge, Opera, and Brave browsers
        </p>
      </Card>
    </div>
  )
}
