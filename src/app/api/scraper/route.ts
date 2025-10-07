import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { scrapeGitHubReadme, scrapePopularRepos } from '@/lib/github-scraper'
import { db, knowledge } from '@/lib/db'
import { eq } from 'drizzle-orm'

const scrapeSchema = z.object({
  repoUrl: z.string().url(),
})

const scrapeTopicSchema = z.object({
  topic: z.string().min(1),
  limit: z.number().min(1).max(50).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if it's a topic-based scrape or single repo scrape
    if (body.topic) {
      const validatedData = scrapeTopicSchema.parse(body)

      // Scrape popular repos for the topic
      const repos = await scrapePopularRepos(
        validatedData.topic,
        validatedData.limit || 10
      )

      const results = []
      for (const repoUrl of repos) {
        try {
          const data = await scrapeGitHubReadme(repoUrl)

          // Check if already exists
          const [existing] = await db
            .select()
            .from(knowledge)
            .where(eq(knowledge.sourceUrl, repoUrl))
            .limit(1)

          if (existing) {
            // Update existing
            await db
              .update(knowledge)
              .set({
                title: data.title,
                summary: data.summary,
                tags: data.tags,
                category: data.category,
                language: data.language,
                features: data.features,
                rawContent: data.rawContent,
                updatedAt: new Date(),
              })
              .where(eq(knowledge.sourceUrl, repoUrl))
          } else {
            // Insert new
            await db.insert(knowledge).values({
              sourceUrl: repoUrl,
              title: data.title,
              summary: data.summary,
              tags: data.tags,
              category: data.category,
              language: data.language,
              features: data.features,
              rawContent: data.rawContent,
            })
          }

          results.push({ url: repoUrl, success: true })
        } catch (error) {
          console.error(`Failed to scrape ${repoUrl}:`, error)
          results.push({
            url: repoUrl,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return NextResponse.json({
        success: true,
        results,
      })
    } else {
      // Single repo scrape
      const validatedData = scrapeSchema.parse(body)

      const data = await scrapeGitHubReadme(validatedData.repoUrl)

      // Check if already exists
      const [existing] = await db
        .select()
        .from(knowledge)
        .where(eq(knowledge.sourceUrl, validatedData.repoUrl))
        .limit(1)

      if (existing) {
        // Update existing
        await db
          .update(knowledge)
          .set({
            title: data.title,
            summary: data.summary,
            tags: data.tags,
            category: data.category,
            language: data.language,
            features: data.features,
            rawContent: data.rawContent,
            updatedAt: new Date(),
          })
          .where(eq(knowledge.sourceUrl, validatedData.repoUrl))
      } else {
        // Insert new
        await db.insert(knowledge).values({
          sourceUrl: validatedData.repoUrl,
          title: data.title,
          summary: data.summary,
          tags: data.tags,
          category: data.category,
          language: data.language,
          features: data.features,
          rawContent: data.rawContent,
        })
      }

      return NextResponse.json({
        success: true,
        data,
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Scraper API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to scrape repository',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve knowledge entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const language = searchParams.get('language')

    let query = db.select().from(knowledge)

    if (category) {
      query = query.where(eq(knowledge.category, category))
    }
    if (language) {
      query = query.where(eq(knowledge.language, language))
    }

    const entries = await query.limit(50)

    return NextResponse.json({
      success: true,
      count: entries.length,
      entries,
    })
  } catch (error) {
    console.error('Knowledge retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve knowledge entries' },
      { status: 500 }
    )
  }
}
