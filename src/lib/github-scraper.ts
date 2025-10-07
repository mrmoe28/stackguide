import { Octokit } from '@octokit/rest'
import { anthropic } from './anthropic'
import { uploadToR2 } from './r2-storage'

if (!process.env.GITHUB_TOKEN) {
  console.warn(
    'GITHUB_TOKEN not set. GitHub scraping will be limited by rate limits.'
  )
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

interface RepoInfo {
  owner: string
  repo: string
}

export async function scrapeGitHubReadme(repoUrl: string): Promise<{
  title: string
  summary: string
  tags: string[]
  category: string
  language: string
  features: string[]
  rawContent: string
}> {
  const repoInfo = parseGitHubUrl(repoUrl)
  if (!repoInfo) {
    throw new Error('Invalid GitHub URL')
  }

  // Fetch README
  const { data: readme } = await octokit.repos.getReadme({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
  })

  const readmeContent = Buffer.from(readme.content, 'base64').toString('utf-8')

  // Fetch repo metadata
  const { data: repo } = await octokit.repos.get({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
  })

  // Use Claude to analyze and extract structured data
  const analysis = await analyzeReadmeWithClaude(readmeContent, repo)

  // Store raw content in R2
  const r2Key = `readme/${repoInfo.owner}/${repoInfo.repo}.md`
  await uploadToR2(r2Key, readmeContent, 'text/markdown')

  return analysis
}

function parseGitHubUrl(url: string): RepoInfo | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) return null

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  }
}

async function analyzeReadmeWithClaude(
  readmeContent: string,
  repoMetadata: Record<string, unknown>
): Promise<{
  title: string
  summary: string
  tags: string[]
  category: string
  language: string
  features: string[]
  rawContent: string
}> {
  const systemPrompt = `You are analyzing a GitHub repository README. Extract structured information and return it in JSON format with these fields:
- "title": The project name (from README or repo name)
- "summary": A concise 2-3 sentence summary of what the project does
- "tags": Array of relevant technology tags (e.g., ["react", "typescript", "ui-library"])
- "category": Primary category (e.g., "Framework", "Library", "Tool", "Database")
- "language": Primary programming language
- "features": Array of 3-5 key features or capabilities

Keep it concise and accurate.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Repository: ${repoMetadata.full_name}
Description: ${repoMetadata.description || 'No description'}
Language: ${repoMetadata.language || 'Unknown'}
Stars: ${repoMetadata.stargazers_count}

README:
${readmeContent.slice(0, 4000)}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    const parsed = JSON.parse(content.text)
    return {
      ...parsed,
      rawContent: readmeContent,
    }
  } catch {
    // Fallback if JSON parsing fails
    return {
      title: repoMetadata.name,
      summary: repoMetadata.description || 'No description available',
      tags: repoMetadata.topics || [],
      category: 'Tool',
      language: repoMetadata.language || 'Unknown',
      features: [],
      rawContent: readmeContent,
    }
  }
}

export async function scrapePopularRepos(
  topic: string,
  limit: number = 10
): Promise<string[]> {
  const { data } = await octokit.search.repos({
    q: `topic:${topic} stars:>1000`,
    sort: 'stars',
    order: 'desc',
    per_page: limit,
  })

  return data.items.map((repo) => repo.html_url)
}
