'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Copy, Check, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import StackCard from '@/components/stack-card'
import CostEstimate from '@/components/cost-estimate'
import ExportShare from '@/components/export-share'
import ChatHistorySidebar from '@/components/chat-history-sidebar'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendations?: Recommendation[]
  claudePrompt?: string | null
}

interface Recommendation {
  name: string
  category: string
  url: string
  description: string
  iconUrl?: string
}

export default function ModernChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hey there! I'm your AI tech stack advisor. Tell me about your project and I'll recommend the perfect tools and frameworks tailored to your needs.",
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

    const lines = originalPrompt.split('\n')
    const firstLine = lines[0]
    const techList = selectedTech.join(', ')
    const customPrompt = `${firstLine.split('using')[0]}using ${techList}. ${lines.slice(1).join('\n')}`

    return customPrompt
  }

  useEffect(() => {
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
    setSelectedStack([])
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

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          "👋 Hey there! I'm your AI tech stack advisor. Tell me about your project and I'll recommend the perfect tools and frameworks tailored to your needs.",
      },
    ])
    setRecommendations([])
    setSelectedStack([])
    setCustomPrompt(null)
  }

  const handleSelectChat = (chatId: string) => {
    // TODO: Load chat from history
    console.log('Loading chat:', chatId)
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="max-w-4xl mx-auto px-4 py-8 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  <div
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-6 py-4 shadow-sm",
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      )}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>

                  {/* Claude Code Prompt */}
                  {message.role === 'assistant' && message.claudePrompt && (
                    <div className="w-full max-w-[85%]">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                            <Zap className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Claude Code Prompt
                            {customPrompt && (
                              <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                                (Customized)
                              </span>
                            )}
                          </h4>
                        </div>
                        {selectedStack.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                            {selectedStack.length} selected
                          </span>
                        )}
                      </div>
                      <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                        <button
                          onClick={() => handleCopyPrompt(customPrompt || message.claudePrompt!, message.id)}
                          className="absolute top-3 right-3 p-2.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-md border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                          title="Copy prompt"
                        >
                          {copiedPromptId === message.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <pre className="p-5 pr-16 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-mono overflow-x-auto leading-relaxed">
                          {customPrompt || message.claudePrompt}
                        </pre>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {customPrompt ? 'Your customized prompt is ready!' : 'Click "Add to Stack" on technologies you want, or copy this prompt as-is'}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 border border-gray-200 dark:border-gray-700">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your project idea... (e.g., 'I want to build a social media app')"
                disabled={loading}
                className="flex-1 h-12 px-4 rounded-xl border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-800"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Recommendations Panel */}
      <div className="w-full md:w-[420px] flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Tech Stack
            </h2>
            {recommendations.length > 0 && (
              <ExportShare
                recommendations={recommendations}
                claudePrompt={customPrompt || messages[messages.length - 1]?.claudePrompt}
              />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {recommendations.length > 0
              ? `${recommendations.length} recommendations`
              : 'Describe your project to get started'}
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  No recommendations yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Tell me about your project to get personalized tech stack recommendations
                </p>
              </div>
            ) : (
              <>
                {/* Cost Estimate */}
                <CostEstimate recommendations={recommendations} />

                {/* Stack Cards */}
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <StackCard
                      key={index}
                      recommendation={rec}
                      isSelected={selectedStack.includes(rec.name)}
                      onToggle={handleToggleStack}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
