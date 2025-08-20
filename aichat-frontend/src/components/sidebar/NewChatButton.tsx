"use client";

import { Plus, Loader2 } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import { getSessions } from "@/utils/getSessions";

export default function NewChatButton() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const setSessions = useSessionStore((s) => s.setSessions);
    const clearSessions = useSessionStore((s) => s.clearSessions);
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const refreshSessions = async () => {
        try {
            const raw = await getSessions();
            if (!raw) {
                clearSessions();
                return;
            }
            const data = Array.isArray(raw) ? raw : [raw];
            const parsed = (data ?? []).map((session: any) => ({
                ...session,
                timestamp: new Date(
                    session.timestamp[0],
                    session.timestamp[1] - 1,
                    session.timestamp[2],
                    session.timestamp[3],
                    session.timestamp[4],
                    session.timestamp[5],
                    Math.floor(session.timestamp[6] / 1000000)
                ).toISOString(),
            }));
            setSessions(parsed.reverse());
        } catch {
            clearSessions();
        }
    };

    const handleNewChat = async () => {
        if (!isAuthenticated || isCreating) return;
        setIsCreating(true);
        try {
            sessionStorage.removeItem("session_id");
            useChatStore.getState().clearMessages();
            router.push("/");
            await refreshSessions();
        } finally {
            setIsCreating(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={handleNewChat}
                    disabled={isCreating}
                    className="font-medium text-white hover:text-white  bg-[#123254] hover:bg-[#194676] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg h-10 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {isCreating ? "Creating..." : "New Chat"}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu> 
    );
}
