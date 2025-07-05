"use client";
import { AppSidebar } from '@/components/app-sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1">
          <SidebarTrigger />
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;
