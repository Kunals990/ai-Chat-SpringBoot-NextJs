"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

// Component to show trigger when sidebar is closed
export function FloatingTrigger() {
  const { open } = useSidebar();
  
  if (open) return null; // Don't show when sidebar is open
  
  return (
    <div className="fixed top-4 left-4 z-50">
      <SidebarTrigger className="h-10 w-10 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200" />
    </div>
  );
}
