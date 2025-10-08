import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import ModernChatInterface from '@/components/modern-chat-interface'

export default async function HomePage() {
  const session = await auth()

  // If not logged in, redirect to sign in page
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Show the modern chat interface for logged-in users
  return (
    <main className="h-screen">
      <ModernChatInterface />
    </main>
  )
}
