"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Branding() {
    return (
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#cbd5e1] tracking-tight">aiChat</h1>
            <SidebarTrigger className="h-6 w-6 text-[#cbd5e1] hover:text-[#527fad] " />
        </div>
    );
}
