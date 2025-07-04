"use client";
import Chat from '@/components/Chat';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import React from 'react';

export default function Home() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        <Chat />
      </main>
    </SidebarProvider>
  );
}
