'use client'

import { useRouter } from 'next/navigation'
import ModernChatInterface from '@/components/modern-chat-interface'
import SettingsMenu from '@/components/settings-menu'
import { Sparkles } from 'lucide-react'

interface DashboardClientProps {
  user: {
    id?: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()

  const handleProfileClick = () => {
    router.push('/settings')
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-blue-950/10 dark:to-indigo-950/10 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                StackGuideR
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Tech Stack Advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
              {user.email}
            </span>
            <SettingsMenu
              userEmail={user.email || ''}
              onProfileClick={handleProfileClick}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ModernChatInterface />
      </main>
    </div>
  )
}
