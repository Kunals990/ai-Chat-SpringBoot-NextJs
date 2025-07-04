"use client"
import { Calendar, ChevronUp, Home, Inbox, Search, Settings, User2, MessageSquare, LogOut, Plus } from "lucide-react"
import { useRouter } from 'next/navigation'

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
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { getSessions } from "@/utils/getSessions";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useChatStore } from "@/store/chatStore"
import { useSessionStore } from "@/store/sessionStore"

// TypeScript interface for session data
interface Session {
  id: string;
  sessionName: string;
  timestamp: string;
}

export function AppSidebar() {
  const { sessions, setSessions, clearSessions } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const router = useRouter();

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
            setUserInfo(JSON.parse(userInfoStr));
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
      
      // Use the store's setSessions method
      setSessions(parsed);
      console.log('Sessions updated:', parsed);
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
  }, [isAuthenticated]); // Dependency on isAuthenticated

  const handleSignOut = () => {
    // Clear all stored auth data
    Cookies.remove('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user_info');
    
    // Redirect to login
    router.push('/login');
  };

  const handleNewChat = async () => {
    if (!isAuthenticated || isCreatingNewChat) return;

    setIsCreatingNewChat(true);
    try {
      // Clear current session - this will force creation of new session when user sends first message
      localStorage.removeItem('session_id');
      
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
    <Sidebar >
      <SidebarContent>
        {/* App Branding */}
        <SidebarGroup>
          <div className="px-4 py-3 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">aiChat</h1>
          </div>
        </SidebarGroup>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/" className="font-medium">
                    <MessageSquare />
                    Chat
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAuthenticated && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={handleNewChat} 
                      disabled={isCreatingNewChat}
                      className="font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 rounded-md"
                    >
                      {isCreatingNewChat ? (
                        <Search className="animate-spin" />
                      ) : (
                        <Plus />
                      )}
                      {isCreatingNewChat ? 'Creating...' : 'New Chat'}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard" className="font-medium">
                        <Home />
                        Dashboard
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {!isAuthenticated && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/login" className="font-medium">
                      <User2 />
                      Login
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat Sessions */}
        <SidebarGroup className="flex-1 overflow-hidden">
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <SidebarMenu>
                {!isAuthenticated ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <User2 />
                      Please login to view sessions
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : loading ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <Search className="animate-spin" />
                      Loading sessions...
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton asChild>
                        <a href={`/?sessionId=${session.id}`} className="flex flex-col items-start">
                          <div className="flex items-center gap-2 w-full">
                            <MessageSquare className="h-4 w-4" />
                            <span className="truncate">{session.sessionName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">
                            {new Date(session.timestamp).toLocaleDateString()}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <MessageSquare />
                      No sessions found
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> 
                    {userInfo?.name || 'User'}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] bg-white border border-gray-200 rounded-md shadow-lg p-1"
                >
                  <DropdownMenuItem className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded">
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded">
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild>
                <a href="/login" className="flex items-center gap-2 text-blue-600 font-medium">
                  <User2 />
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