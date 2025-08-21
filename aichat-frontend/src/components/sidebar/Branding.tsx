"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { FaGithub } from "react-icons/fa"; 

export default function Branding() {
    return (
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#cbd5e1] tracking-tight">aiChat</h1>
            <div className="flex items-center space-x-4">
                <a
                    href="https://github.com/Kunals990/ai-Chat-SpringBoot-NextJs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#cbd5e1] hover:text-[#527fad]"
                >
                    <FaGithub className="h-6 w-6" />
                </a>
                <SidebarTrigger className="h-6 w-6 text-[#cbd5e1] hover:text-[#527fad]" />
            </div>
        </div>
    );
}