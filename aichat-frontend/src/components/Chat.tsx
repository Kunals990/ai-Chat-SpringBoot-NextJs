"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredIdToken } from '@/utils/auth'
import LoginPopup from './LoginPopup'
import Cookies from 'js-cookie'
import { useChatStore } from '@/store/chatStore'
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useSessionStore } from '@/store/sessionStore'

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
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const setMessages = useChatStore((state) => state.setMessages);
  const [inputMessage, setInputMessage] = useState('')
  const [selectedLLM, setSelectedLLM] = useState('gemini')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {sessions,setSessions,addSessions} = useSessionStore();

  const llmOptions: LLMOption[] = [
    { value: 'gemini', label: 'Gemini 2.5 Flash', icon: '🤖' },
    { value: 'openai', label: 'OpenAI GPT', icon: '⚡' }
  ]

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('access_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    
    // Check periodically in case user logs in/out in another tab
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for session changes and clear messages if needed
  useEffect(() => {
    const handleNewChatSession = () => {
      // Clear messages when new chat session is created
      setMessages([]);
      setInputMessage('');
    };

    // Listen for new chat session event from sidebar
    window.addEventListener('newChatSession', handleNewChatSession);
    
    return () => {
      window.removeEventListener('newChatSession', handleNewChatSession);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewSession = async () => {
    try {
      const response = await fetch(`${backendUrl}/chat/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const sessionId = data.id;
        const session_name = data.sessionName;
        console.log(session_name);
        return sessionId;
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error("Failed to get session id: ", error);
      throw new Error("Failed to get session id");
    }
  };

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginPopup(true)
      return
    }

    //check for session id -> if not create one

    var session_id = localStorage.getItem('session_id');
    
    if(!session_id){
      session_id = await createNewSession();
    }


    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    // Add user message to store
    addMessage(userMessage);
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

      // const session_id = localStorage.getItem('session_id');
      console.log("session_id:", session_id);
      // console.log("session_id:", temp_session_id);

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
      
      // Add assistant message to store
      addMessage(assistantMessage);

      const checkSessionId = localStorage.getItem('session_id');
      if(!checkSessionId){
          const response = await fetch(`${backendUrl}/chat/session-name`, {
          method: 'POST',
          credentials:"include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(session_id)
        })
        const sessionName = await response.text();
        //got session name
        const newSession = {
          id: session_id!,
          sessionName,
          timestamp: new Date().toISOString(),
        };
        addSessions(newSession);
        localStorage.setItem('session_id', session_id || '');
        
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      
      // Add error message to store
      addMessage(errorMessage);
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
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto w-full p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to aiChat!
              </h3>
              {isAuthenticated ? (
                <p className="text-gray-600">
                  Start a conversation with your AI assistant. Choose your preferred model and ask anything!
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Experience AI-powered conversations with multiple language models.
                  </p>
                  <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                    <p className="text-blue-700 text-sm">
                      🔒 Please login to start chatting with AI assistants
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => setShowLoginPopup(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                    >
                      Login to Get Started
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="w-full">
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
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
      <div className="bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center space-x-4">
              {/* Model Selector */}
              <div className="flex-shrink-0">
                <select
                  value={selectedLLM}
                  onChange={(e) => setSelectedLLM(e.target.value)}
                  disabled={!isAuthenticated}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {llmOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-700">
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Search Icon */}
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value)
                    // Auto-resize
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={isAuthenticated ? "Type your message here..." : "Please login to start chatting..."}
                  rows={1}
                  className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none text-base py-2 overflow-hidden"
                  disabled={isLoading || !isAuthenticated}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
              </div>
              
              {/* Send Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading || !isAuthenticated}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={!isAuthenticated ? "Please login to send messages" : "Send message"}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
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
      </div>

      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
      />
    </div>
  )
}

export default Chat
