'use client'

import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/chat-interface'
import SettingsMenu from '@/components/settings-menu'

export default function DashboardPage() {
  const router = useRouter()

  const handleProfileClick = () => {
    router.push('/settings')
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            StackGuideR
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
              ekosolarize@gmail.com
            </span>
            <SettingsMenu
              userEmail="ekosolarize@gmail.com"
              onProfileClick={handleProfileClick}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface userId="demo-user" />
      </main>
    </div>
  )
}
