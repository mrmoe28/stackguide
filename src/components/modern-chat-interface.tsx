'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Copy, Check, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

    // Match format: "Build X using A, B, C. Create/Setup/Implementation steps..."
    // We want to replace the tech stack (A, B, C) while keeping everything else
    // Using [\s\S] instead of . with s flag for ES2018 compatibility
    const usingMatch = originalPrompt.match(/^([\s\S]*?)\s+using\s+([\s\S]*?)\.\s+(Create|Setup|Build|Implementation|Steps?|1\))/i)

    if (!usingMatch) {
      // Fallback: if no standard pattern found, try to find "using" and replace from there
      const simpleMatch = originalPrompt.match(/^([\s\S]*?)\s+using\s+([\s\S]*)$/i)
      if (simpleMatch) {
        return `${simpleMatch[1].trim()} using ${selectedTech.join(', ')}`
      }
      // Last resort: prepend the tech stack
      return `Using ${selectedTech.join(', ')}: ${originalPrompt}`
    }

    const [, projectDescription, , stepKeyword] = usingMatch
    const techList = selectedTech.join(', ')

    // Get everything after the tech stack period
    const afterTech = originalPrompt.substring(originalPrompt.indexOf(stepKeyword))

    // Reconstruct with custom tech stack while preserving all implementation steps
    return `${projectDescription.trim()} using ${techList}. ${afterTech.trim()}`
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
    <div className="h-full flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 overflow-y-auto">
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
                        "max-w-[85%] rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/30'
                          : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50 shadow-gray-200/50 dark:shadow-none'
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
                      <div className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl overflow-hidden border-2 border-purple-300 dark:border-purple-800 shadow-xl shadow-purple-200/50 dark:shadow-none">
                        {/* Decorative accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

                        <button
                          onClick={() => handleCopyPrompt(customPrompt || message.claudePrompt!, message.id)}
                          className="absolute top-4 right-3 p-2.5 rounded-lg bg-white/90 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-md border border-purple-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:scale-105"
                          title="Copy prompt"
                        >
                          {copiedPromptId === message.id ? (
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <pre className="p-5 pr-16 pt-6 text-sm text-purple-900 dark:text-gray-100 whitespace-pre-wrap font-mono overflow-x-auto leading-relaxed selection:bg-purple-300 selection:text-purple-900">
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
                className="flex-1 h-12 px-4 rounded-xl border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 dark:hover:border-blue-600"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
      <div className="w-full md:w-[420px] flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 flex-shrink-0 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>

          <div className="flex items-center justify-between mb-2 relative z-10">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              Tech Stack
            </h2>
            {recommendations.length > 0 && (
              <ExportShare
                recommendations={recommendations}
                claudePrompt={customPrompt || messages[messages.length - 1]?.claudePrompt}
              />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 relative z-10">
            {recommendations.length > 0
              ? `${recommendations.length} recommendations`
              : 'Describe your project to get started'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-16 px-4 animate-in fade-in duration-700">
                {/* Animated Icon with Glow */}
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse">
                    <Sparkles className="h-10 w-10 text-white animate-bounce" />
                  </div>
                  {/* Decorative rings */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-xl animate-pulse"></div>
                  <div className="absolute -inset-2 rounded-full border-2 border-blue-400/20 animate-ping"></div>
                </div>

                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Ready to Build Something Amazing?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Describe your project idea
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                  Get instant, AI-powered tech stack recommendations tailored to your needs
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
        </div>
      </div>
    </div>
  )
}
