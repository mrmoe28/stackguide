'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import StackCard from '@/components/stack-card'
import CodeViewer from '@/components/code-viewer'

interface CodeFile {
  path: string
  content: string
  language: string
}

interface Boilerplate {
  projectName: string
  description: string
  files: CodeFile[]
  setup: string[]
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendations?: Recommendation[]
  boilerplate?: Boilerplate | null
  claudePrompt?: string | null
}

interface Recommendation {
  name: string
  category: string
  url: string
  description: string
  iconUrl?: string
}

interface ChatInterfaceProps {
  userId: string
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm your tech stack advisor. Tell me about your project and I'll recommend the best tools and frameworks for you.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedStack, setSelectedStack] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState<string | null>(null)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleCopyPrompt = async (prompt: string, messageId: string) => {
    await navigator.clipboard.writeText(prompt)
    setCopiedPromptId(messageId)
    setTimeout(() => setCopiedPromptId(null), 2000)
  }

  const handleToggleStack = (techName: string) => {
    setSelectedStack((prev) =>
      prev.includes(techName)
        ? prev.filter((name) => name !== techName)
        : [...prev, techName]
    )
  }

  const generateCustomPrompt = (originalPrompt: string, selectedTech: string[]) => {
    if (selectedTech.length === 0) return originalPrompt

    // Extract the project description from the original prompt
    const lines = originalPrompt.split('\n')
    const firstLine = lines[0]

    // Create new prompt with selected technologies
    const techList = selectedTech.join(', ')
    const customPrompt = `${firstLine.split('using')[0]}using ${techList}. ${lines.slice(1).join('\n')}`

    return customPrompt
  }

  useEffect(() => {
    // Update custom prompt when selected stack changes
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.claudePrompt && selectedStack.length > 0) {
      const newPrompt = generateCustomPrompt(lastMessage.claudePrompt, selectedStack)
      setCustomPrompt(newPrompt)
    } else {
      setCustomPrompt(null)
    }
  }, [selectedStack, messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setSelectedStack([]) // Reset selected stack for new query
    setCustomPrompt(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        recommendations: data.recommendations,
        boilerplate: data.boilerplate || null,
        claudePrompt: data.claudePrompt || null,
      }

      setMessages((prev) => [...prev, assistantMessage])
      if (data.recommendations) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div ref={scrollRef} className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  <div
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                  {/* Show Claude Code prompt if available */}
                  {message.role === 'assistant' && message.claudePrompt && (
                    <div className="w-full">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🚀</span>
                          <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                            Claude Code Prompt
                            {customPrompt && (
                              <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                                (Customized)
                              </span>
                            )}
                          </h4>
                        </div>
                        {selectedStack.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedStack.length} selected
                          </span>
                        )}
                      </div>
                      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border-2 border-blue-200 dark:border-slate-700 shadow-sm">
                        <button
                          onClick={() => handleCopyPrompt(customPrompt || message.claudePrompt!, message.id)}
                          className="absolute top-3 right-3 p-2 rounded-md bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm border border-gray-200 dark:border-slate-600"
                          title="Copy prompt"
                        >
                          {copiedPromptId === message.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <pre className="p-4 pr-14 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-mono overflow-x-auto leading-relaxed">
                          {customPrompt || message.claudePrompt}
                        </pre>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                        💡 {customPrompt ? 'Your customized prompt is ready!' : 'Click "Add to Stack" on technologies you want, or copy this prompt as-is'}
                      </p>
                    </div>
                  )}
                  {/* Show boilerplate code if available */}
                  {message.role === 'assistant' && message.boilerplate && (
                    <div className="w-full">
                      <CodeViewer
                        files={message.boilerplate.files}
                        projectName={message.boilerplate.projectName}
                        setup={message.boilerplate.setup}
                      />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <Separator />
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your project..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Recommendations Panel */}
      <div className="w-full md:w-96 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended Stack
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {recommendations.length > 0
              ? `${recommendations.length} recommendations`
              : 'Ask me about your project'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">
                  Recommendations will appear here after you describe your
                  project
                </p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <StackCard
                  key={index}
                  recommendation={rec}
                  isSelected={selectedStack.includes(rec.name)}
                  onToggle={handleToggleStack}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
