import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import DashboardClient from '@/components/dashboard-client'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return <DashboardClient user={session.user} />
}
