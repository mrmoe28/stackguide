import ChatInterface from '@/components/chat-interface'

export default function DashboardPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            StackGuideR
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ekosolarize@gmail.com
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface userId="demo-user" />
      </main>
    </div>
  )
}
