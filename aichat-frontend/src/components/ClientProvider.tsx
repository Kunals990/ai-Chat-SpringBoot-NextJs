'use client'

import { useEffect } from 'react'

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const hasVisited = localStorage.getItem('has_visited_before')

    if (!hasVisited) {
      localStorage.removeItem('session_id')
      localStorage.setItem('has_visited_before', 'true')
    }
  }, [])

  return <>{children}</>
}