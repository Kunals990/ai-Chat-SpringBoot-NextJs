import GoogleLogin from '@/components/GoogleLogin'
import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to AiChat
          </h1>
          <p className="text-gray-600 mb-8">
            Sign in to continue to your AI-powered chat experience
          </p>
        </div>
         <GoogleLogin/>
      </div>
    </div>
  )
}

export default page
