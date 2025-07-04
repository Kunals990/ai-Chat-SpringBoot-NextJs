import Chat from '@/components/Chat'
import ProtectedRoute from '@/components/ProtectedRoute'
import React from 'react'

const ChatPage = () => {
  return (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  )
}

export default ChatPage
