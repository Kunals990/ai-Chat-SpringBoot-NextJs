"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FloatingTrigger } from '@/components/FloatingTrigger';
import React from 'react';
import ChatPage from "@/components/chat/ChatPage";
import NewAppSidebar from "@/components/sidebar/NewAppSidebar";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider defaultOpen={true}>
        <NewAppSidebar />
        <SidebarInset>
          <main className="flex-1 h-full relative">
            <FloatingTrigger />
            <ChatPage />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
