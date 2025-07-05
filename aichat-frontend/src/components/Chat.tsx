"use client"
import React, { useState, useRef, useEffect, useDeferredValue } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredIdToken } from '@/utils/auth'
import LoginPopup from './LoginPopup'
import Cookies from 'js-cookie'
import { useChatStore } from '@/store/chatStore'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { useSessionStore } from '@/store/sessionStore'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send } from 'lucide-react'
import { shallow } from 'zustand/shallow'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface LLMOption {
  value: string
  label: string
  icon: string
}

// Memoized Markdown renderer
const MemoizedMarkdown = React.memo(MarkdownRenderer)

// Memoized ChatMessage component
const ChatMessage = React.memo(({ message }: { message: Message }) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        <div className="w-full">
          {message.role === 'user' ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <MemoizedMarkdown content={message.content} />
          )}
        </div>
        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
})

const Chat = () => {
  const router = useRouter()
  const messages = useChatStore((state) => state.messages)
  const addMessage = useChatStore((state) => state.addMessage)
  const setMessages = useChatStore((state) => state.setMessages)
  const [inputMessage, setInputMessage] = useState('')
  const deferredInput = useDeferredValue(inputMessage)
  const [selectedLLM, setSelectedLLM] = useState('gemini')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sessions, setSessions, addSessions } = useSessionStore()

  const llmOptions: LLMOption[] = [
    { value: 'gemini', label: 'Gemini 2.5 Flash', icon: '✨' },
    { value: 'openai', label: 'OpenAI GPT', icon: '🧠' }
  ]

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

  // Check authentication status once
  useEffect(() => {
    const token = Cookies.get('access_token')
    setIsAuthenticated(!!token)

    // Optional: polling auth if user may log in from other tab
    // const interval = setInterval(() => {
    //   setIsAuthenticated(!!Cookies.get('access_token'))
    // }, 1000)
    // return () => clearInterval(interval)
  }, [])

  // Listen for new chat session and clear messages
  useEffect(() => {
    const handleNewChatSession = () => {
      setMessages([])
      setInputMessage('')
    }

    window.addEventListener('newChatSession', handleNewChatSession)
    return () => window.removeEventListener('newChatSession', handleNewChatSession)
  }, [])

  // Scroll when messages length changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const createNewSession = async () => {
    try {
      const response = await fetch(`${backendUrl}/chat/session`, {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        return data.id
      } else throw new Error('Failed to create session')
    } catch (error) {
      console.error("Failed to get session id: ", error)
      throw new Error("Failed to get session id")
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    if (!isAuthenticated) {
      setShowLoginPopup(true)
      return
    }

    let session_id = sessionStorage.getItem('session_id')
    if (!session_id) session_id = await createNewSession()

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInputMessage('')
    setIsLoading(true)
    console.log(messages);
    try {
      const token = getStoredIdToken()
      if (!token) throw new Error('No authentication token found')

      const response = await fetch(`${backendUrl}/chat/llm`, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          role: "USER",
          LLM: selectedLLM,
          session: { id: session_id },
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to send message: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      }

      addMessage(assistantMessage)

      const checkSessionId = sessionStorage.getItem('session_id')
      if (!checkSessionId) {
        const response = await fetch(`${backendUrl}/chat/session-name`, {
          method: 'POST',
          credentials: "include",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session_id)
        })

        const sessionName = await response.text()
        addSessions({
          id: session_id!,
          sessionName,
          timestamp: new Date().toISOString(),
        })
        sessionStorage.setItem('session_id', session_id || '')
      }

    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-full bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto w-full p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to aiChat</h3>
              {isAuthenticated ? (
                <p className="text-gray-600">Start a conversation with your AI assistant.</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Please login to start chatting with AI assistants.</p>
                  <button
                    onClick={() => setShowLoginPopup(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Login to Get Started
                  </button>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-300 p-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-1">
                <Select
                  value={selectedLLM}
                  onValueChange={setSelectedLLM}
                  disabled={!isAuthenticated}
                >
                  <SelectTrigger className="w-[160px] bg-white border-gray-300">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {llmOptions.find(opt => opt.value === selectedLLM)?.label}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {llmOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Textarea
                  value={deferredInput}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={isAuthenticated ? "Type your message here..." : "Please login to start chatting..."}
                  disabled={isLoading || !isAuthenticated}
                  className="min-h-[40px] max-h-[120px] resize-none border-gray-300 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 text-sm"
                />
              </div>

              <div className="flex-shrink-0 pt-1">
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading || !isAuthenticated}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!isAuthenticated ? "Please login to send messages" : "Send message"}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
    </div>
  )
}

export default Chat
