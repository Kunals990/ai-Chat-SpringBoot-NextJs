/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { ChevronUp,Search, Settings, User2, MessageSquare, LogOut, Plus } from "lucide-react"
import { useRouter, useParams } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { getSessions } from "@/utils/getSessions";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useChatStore } from "@/store/chatStore"
import { useSessionStore } from "@/store/sessionStore"

// TypeScript interface for session data
// interface Session {
//   id: string;
//   sessionName: string;
//   timestamp: string;
// }

interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export function AppSidebar() {
  const { sessions, setSessions, clearSessions } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  // Get current session ID from URL params
  const currentSessionId = params?.sessionId as string;

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = Cookies.get('access_token');
      setIsAuthenticated(!!token);
      
      if (token) {
        // Get user info from localStorage
        const userInfoStr = localStorage.getItem('user_info');
        if (userInfoStr) {
          try {
            setUserInfo(JSON.parse(userInfoStr) as UserInfo);
          } catch (error) {
            console.error('Error parsing user info:', error);
          }
        }
      }
    };

    checkAuth();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const raw = await getSessions();
      
      if (!raw) {
        console.log('No sessions returned from API');
        clearSessions();
        return;
      }

      const data = Array.isArray(raw) ? raw : [raw]; 
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
      
      // Reverse the array to show latest sessions first
      const reversedSessions = parsed.reverse();
      
      // Use the store's setSessions method
      setSessions(reversedSessions);
      // console.log('Sessions updated (latest first):', reversedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      clearSessions(); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch sessions if user is authenticated
    if (!isAuthenticated) return;

    fetchSessions();
  }, [isAuthenticated,sessions.length]); // Dependency on isAuthenticated

  const handleSignOut = () => {
    // Clear all stored auth data
    Cookies.remove('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    
    // Redirect to login
    router.push('/login');
  };

  const handleNewChat = async () => {
    if (!isAuthenticated || isCreatingNewChat) return;

    setIsCreatingNewChat(true);
    try {
      // Clear current session - this will force creation of new session when user sends first message
      sessionStorage.removeItem('session_id');
      
      //Clear all messages
      useChatStore.getState().clearMessages(); 
      router.push('/');
      
      // Refresh sessions list to show updated recent chats

      await fetchSessions();
      
    } catch (error) {
      console.log('Error creating new chat:', error);
    } finally {
      setIsCreatingNewChat(false);
    }
  };
  return (
    <Sidebar className="border-r border-gray-100 bg-white">
      <SidebarContent className="bg-white">
        {/* App Branding */}
        <SidebarGroup>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">aiChat</h1>
            <SidebarTrigger className="h-6 w-6 text-gray-500 hover:text-gray-700 transition-colors" />
          </div>
        </SidebarGroup>

        {/* Navigation Menu */}
        <SidebarGroup className="px-3 py-2">
          <SidebarMenu>
            {isAuthenticated && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleNewChat} 
                  disabled={isCreatingNewChat}
                  className="font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg h-10 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isCreatingNewChat ? (
                    <Search className="animate-spin h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isCreatingNewChat ? 'Creating...' : 'New Chat'}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {!isAuthenticated && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors rounded-lg h-10">
                    <User2 className="h-4 w-4" />
                    Login
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Chat Sessions */}
        <SidebarGroup className="flex-1 overflow-hidden px-3">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <SidebarMenu className="space-y-1">
                {!isAuthenticated ? (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-500 text-sm">
                      <User2 className="h-4 w-4" />
                      Please login to view sessions
                    </div>
                  </SidebarMenuItem>
                ) : loading ? (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-500 text-sm">
                      <Search className="animate-spin h-4 w-4" />
                      Loading sessions...
                    </div>
                  </SidebarMenuItem>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((session) => {
                    const isSelected = currentSessionId === session.id;
                    return (
                      <SidebarMenuItem key={session.id}>
                        {isSelected ? (
                          <div className="bg-blue-600 text-white flex flex-col items-start p-3 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3 w-full">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate font-medium">{session.sessionName}</span>
                            </div>
                            <span className="text-xs text-blue-100 ml-7 mt-1">
                              {new Date(session.timestamp).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        ) : (
                          <SidebarMenuButton asChild>
                            <a 
                              href={`/chat/${session.id}`} 
                              className="flex flex-col items-start p-3 hover:bg-gray-50 transition-colors rounded-lg group"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                                <span className="truncate text-gray-700 group-hover:text-gray-900">{session.sessionName}</span>
                              </div>
                              <span className="text-xs text-gray-400 ml-7 mt-1">
                                {new Date(session.timestamp).toLocaleDateString('en-GB')}
                              </span>
                            </a>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    );
                  })
                ) : (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-500 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      No sessions found
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-100 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-12 px-3 hover:bg-gray-50 transition-colors rounded-lg">
                    <User2 className="h-5 w-5 text-gray-600" /> 
                    <span className="font-medium text-gray-700">{userInfo?.name || 'User'}</span>
                    <ChevronUp className="ml-auto h-4 w-4 text-gray-400" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[200px]"
                >
                  <DropdownMenuItem className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer rounded-lg transition-colors flex items-center gap-3">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="px-4 py-3 text-sm hover:bg-red-50 cursor-pointer rounded-lg text-red-600 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild>
                <a href="/login" className="flex items-center gap-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors rounded-lg h-12 px-3">
                  <User2 className="h-5 w-5" />
                  <span>Please Login</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}