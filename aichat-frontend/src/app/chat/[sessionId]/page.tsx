/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useChatStore } from '@/store/chatStore';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Chat from '@/components/Chat';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { FloatingTrigger } from '@/components/FloatingTrigger';
import Cookies from 'js-cookie';

// DTO interface for backend response
// interface SessionChatsResponse {
//   message: string;
//   role: 'USER' | 'ASSISTANT';
//   LLM: string;
//   timestamp: string;
// }

export default function SessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';
    const { setMessagesFromResponse, clearMessages } = useChatStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set the session ID in sessionStorage for the chat component
        sessionStorage.setItem('session_id', sessionId);
    console.log("session id is:", sessionId);
    
    // Add validation for sessionId format
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID');
    }
    
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      throw new Error(`Invalid UUID format: ${sessionId}`);
    }
    
    const token = Cookies.get('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log("Sending sessionId to backend:", sessionId);
        
        const res = await fetch(`${backendUrl}/chat/all-chats`, {
          method: "POST",
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId
          })
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch chats: ${res.status}`);
        }

        const raw = await res.json();
        const data = Array.isArray(raw) ? raw : [raw]; 
        // const data: SessionChatsResponse[] = await res.json();
        const parsed = (data ?? []).map((session: any) => ({
        ...session,
        timestamp: new Date(
            session.timestamp[0],
            session.timestamp[1] - 1,
            session.timestamp[2],
            session.timestamp[3],
            session.timestamp[4],
            session.timestamp[5],
            Math.floor(session.timestamp[6] / 1000000)
        ).toISOString()
        }));
        // Clear existing messages and set new ones
        clearMessages();
        if (data && data.length > 0) {
          setMessagesFromResponse(parsed);
        }
        
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chats');
        clearMessages();
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      if (sessionId) {
        fetchChats();
      }
    }, [sessionId]);
    
    if (loading) {
      return (
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center relative">
            <FloatingTrigger />
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading chat history...</p>
            </div>
          </main>
        </SidebarProvider>
      );
    }

    if (error) {
      return (
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center relative">
            <FloatingTrigger />
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button 
                onClick={fetchChats}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </main>
        </SidebarProvider>
      );
    }

    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 relative">
          <FloatingTrigger />
          <Chat />
        </main>
      </SidebarProvider>
    );
}
