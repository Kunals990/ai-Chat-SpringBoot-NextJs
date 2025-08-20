"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function FloatingTrigger() {
  const { open } = useSidebar();
  
  if (open) return null; // Don't show when sidebar is open
  
  return (
    <div className="fixed top-4 left-4 z-50 bg-[#01172f]">
      <SidebarTrigger className="h-10 w-10  text-white bg-[#01172f] shadow-lg hover:bg-gray-200 transition-all duration-200 " />
    </div>
  );
}
