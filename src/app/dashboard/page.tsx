import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import ChatInterface from '@/components/chat-interface'
import SignOutButton from '@/components/sign-out-button'

export default async function DashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            StackGuideR
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session.user?.email || 'User'}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface userId={session.user?.id || ''} />
      </main>
    </div>
  )
}
