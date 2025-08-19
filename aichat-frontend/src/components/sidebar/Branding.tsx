"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Branding() {
    return (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">aiChat</h1>
            <SidebarTrigger className="h-6 w-6 text-gray-500 hover:text-gray-700 transition-colors" />
        </div>
    );
}
