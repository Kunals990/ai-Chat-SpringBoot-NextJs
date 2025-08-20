"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Loader2, User2 } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import { getSessions } from "@/utils/getSessions";

export default function SessionsList() {
    const { sessions, setSessions, clearSessions } = useSessionStore();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const currentSessionId = (params?.sessionId as string) || "";

    useEffect(() => {
        if (!isAuthenticated) return;

        let cancelled = false;
        const fetchSessions = async () => {
            setLoading(true);
            try {
                const raw = await getSessions();
                if (!raw) {
                    if (!cancelled) clearSessions();
                    return;
                }
                const data = Array.isArray(raw) ? raw : [raw];
                const parsed = data.map((session: any) => ({
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
                if (!cancelled) setSessions(parsed.reverse());
            } catch {
                if (!cancelled) clearSessions();
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchSessions();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, setSessions, clearSessions]);

    if (!isAuthenticated) {
        return (
            <div className="max-h-[400px] overflow-y-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-3 py-2 text-gray-500 text-sm">
                            <User2 className="h-4 w-4" />
                            Please login to view sessions
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
        );
    }

    return (
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <SidebarMenu className="space-y-1">
                {loading ? (
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-3 py-2 text-gray-500 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading sessions...
                        </div>
                    </SidebarMenuItem>
                ) : sessions && sessions.length > 0 ? (
                    sessions.map((session) => {
                        const isSelected = String(currentSessionId) === String(session.id);
                        const dateStr = new Date(session.timestamp).toLocaleDateString("en-GB");
                        return (
                            <SidebarMenuItem key={session.id}>
                                {isSelected ? (
                                    <div className="bg-blue-600 text-white flex flex-col items-start p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3 w-full">
                                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate font-medium">{session.sessionName}</span>
                                        </div>
                                        <span className="text-xs text-blue-100 ml-7 mt-1">{dateStr}</span>
                                    </div>
                                ) : (
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={`/chat/${session.id}`}
                                            className="flex flex-col items-start p-3 hover:bg-gray-50 transition-colors rounded-lg group w-full"
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                                                <span className="truncate text-gray-700 group-hover:text-gray-900">
                          {session.sessionName}
                        </span>
                                            </div>
                                            <span className="text-xs text-gray-400 ml-7 mt-1">{dateStr}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        );
                    })
                ) : (
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-3 py-2 text-gray-500 text-sm">
                            <MessageSquare className="h-4 w-4" />
                            No sessions found
                        </div>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </div>
    );
}
