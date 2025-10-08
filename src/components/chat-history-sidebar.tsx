'use client'

import { useState } from 'react'
import { Plus, MessageSquare, Clock, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ChatSession {
  id: string
  title: string
  createdAt: Date
  preview: string
}

interface ChatHistorySidebarProps {
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  activeChat?: string
}

export default function ChatHistorySidebar({
  onNewChat,
  onSelectChat,
  activeChat
}: ChatHistorySidebarProps) {
  // Mock chat history - will be replaced with real data
  const [chats, setChats] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'E-commerce Platform',
      createdAt: new Date(Date.now() - 86400000),
      preview: 'Next.js, Stripe, PostgreSQL...'
    },
    {
      id: '2',
      title: 'Social Media App',
      createdAt: new Date(Date.now() - 172800000),
      preview: 'React Native, Firebase...'
    },
    {
      id: '3',
      title: 'AI Chatbot',
      createdAt: new Date(Date.now() - 259200000),
      preview: 'Python, FastAPI, OpenAI...'
    }
  ])

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation() // Prevent triggering the chat selection
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId))
  }

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Recent Projects
          </div>

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "relative group w-full text-left p-3 rounded-lg transition-all duration-200",
                "hover:bg-white dark:hover:bg-gray-800 hover:shadow-md",
                "border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
                activeChat === chat.id && "bg-white dark:bg-gray-800 shadow-md border-blue-200 dark:border-blue-800"
              )}
            >
              <button
                onClick={() => onSelectChat(chat.id)}
                className="w-full flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {chat.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {chat.preview}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDate(chat.createdAt)}
                  </div>
                </div>
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteChat(e, chat.id)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all shadow-sm border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-800"
                title="Delete project"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-t from-gray-100 to-transparent dark:from-gray-900 dark:to-transparent">
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          {chats.length} saved {chats.length === 1 ? 'project' : 'projects'}
        </div>
      </div>
    </div>
  )
}
