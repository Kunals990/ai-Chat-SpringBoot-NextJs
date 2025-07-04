"use client";
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardContent from '@/components/DashboardContent';

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1">
          <SidebarTrigger />
          <DashboardContent />
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;
