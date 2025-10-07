import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db, knowledge, users, projects, recommendations } from '@/lib/db'
import { sql } from 'drizzle-orm'
import AdminDashboard from '@/components/admin-dashboard'

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch stats
  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)

  const [projectCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects)

  const [recommendationCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(recommendations)

  const [knowledgeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(knowledge)

  // Fetch recent knowledge entries
  const recentKnowledge = await db
    .select()
    .from(knowledge)
    .orderBy(sql`${knowledge.createdAt} DESC`)
    .limit(20)

  const stats = {
    users: Number(userCount.count),
    projects: Number(projectCount.count),
    recommendations: Number(recommendationCount.count),
    knowledge: Number(knowledgeCount.count),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AdminDashboard stats={stats} knowledgeEntries={recentKnowledge} />
      </main>
    </div>
  )
}
