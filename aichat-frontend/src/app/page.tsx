"use client";
import Chat from '@/components/Chat';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { FloatingTrigger } from '@/components/FloatingTrigger';
import React from 'react';

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 h-full relative">
            <FloatingTrigger />
            <Chat />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
