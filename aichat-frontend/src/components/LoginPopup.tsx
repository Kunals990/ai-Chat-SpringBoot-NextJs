"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose }) => {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Login Required
          </h3>
          
          <p className="text-gray-600 mb-6">
            You need to be logged in to start chatting with AI. Please login to continue.
          </p>
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogin}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPopup
