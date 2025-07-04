"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredIdToken, getUserInfo, logout } from '@/utils/auth'
import Cookies from 'js-cookie';

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

const Chat = () => {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedLLM, setSelectedLLM] = useState('gemini')
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const llmOptions: LLMOption[] = [
    { value: 'gemini', label: 'Google Gemini', icon: '🤖' },
    { value: 'openai', label: 'OpenAI GPT', icon: '⚡' }
  ]

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const user = getUserInfo()
    // const session_id = getSessionId();
    setUserInfo(user)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLogout = () => {
    logout();
    router.push('/login')
  }

  const sendMessage = async () => {

    if (!inputMessage.trim() || isLoading) return

    //check for session id -> if not create one

    const session_id = localStorage.getItem('session_id');
    if(!session_id){
      try{
        const response = await fetch(`${backendUrl}/chat/session`,{
          method:"POST",
          credentials:"include",
          headers: {
          'Content-Type': 'application/json',
        },
        })

        const data = await response.json();
        const sessionId = data.id;
        const session_name = data.sessionName;
        localStorage.setItem('session_id',sessionId);
      }catch(error){
        console.error("Failed to get session id: ",error);
        throw new Error("Failed to get session id");
      }
    }


    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const token = getStoredIdToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('Token found, length:', token.length)
      console.log('Token preview:', token.substring(0, 50) + '...')
      console.log('Sending message:', inputMessage, 'with LLM:', selectedLLM)

      const session_id = localStorage.getItem('session_id');
      console.log("session_id:", session_id);

      const response = await fetch(`${backendUrl}/chat/llm`, {
        method: 'POST',
        credentials:"include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          role: "USER",
          LLM: selectedLLM,
          session:{
            id:session_id,
          },
        })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Response error:', errorData)
        throw new Error(`Failed to send message: ${response.status} - ${errorData}`)
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">aiChat</h1>
          
          <div className="flex items-center space-x-4">
            {/* LLM Selector */}
            <div className="flex items-center space-x-2 text-black">
              <label htmlFor="llm-select" className="text-sm font-medium text-gray-700">
                AI Model:
              </label>
              <select
                id="llm-select"
                value={selectedLLM}
                onChange={(e) => setSelectedLLM(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {llmOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-3">
              {userInfo && (
                <div className="flex items-center space-x-2">
                  {userInfo.picture && (
                    <img 
                      src={userInfo.picture} 
                      alt={userInfo.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">{userInfo.name}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to aiChat!
              </h3>
              <p className="text-gray-600">
                Start a conversation with your AI assistant. Choose your preferred model and ask anything!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
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

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 text-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
