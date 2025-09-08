"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import NewAppSidebar from "@/components/sidebar/NewAppSidebar";
import { FloatingTrigger } from "@/components/FloatingTrigger";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useChatStore } from "@/stores/chatStore";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import RemainingMessagesAlert from "@/components/chat/RemainingMessagesAlert";

function parseBackendTimestamp(ts: any): Date {
  if (Array.isArray(ts) && ts.length >= 7) {
    const [y, m, d, h, min, s, ns] = ts;
    return new Date(
      y,
      (m ?? 1) - 1,
      d ?? 1,
      h ?? 0,
      min ?? 0,
      s ?? 0,
      Math.floor((ns ?? 0) / 1_000_000)
    );
  }
  const d2 = new Date(ts);
  return isNaN(d2.getTime()) ? new Date() : d2;
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const setMessages = useChatStore((s) => s.setMessages);

  useEffect(() => {
    if (!sessionId) return;

    const loadMessages = async () => {
      try {
        const res = await fetchWithAuth(`/api/chat/all-chats`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) throw new Error("Failed to fetch session chats");
        const data = await res.json();

        const normalized = (data ?? []).map((m: any, idx: number) => ({
          id: String(idx),
          content: m.message,
          role: String(m.role || "").toLowerCase(), // USER/ASSISTANT -> user/assistant
          timestamp: parseBackendTimestamp(m.timestamp), // ✅ always a Date
        }));

        setMessages(normalized);
        sessionStorage.setItem("session_id", String(sessionId));
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };

    loadMessages();
  }, [sessionId, setMessages]);

  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider defaultOpen={true}>
        <NewAppSidebar />
        <SidebarInset>
          <main className="flex-1 h-full relative">
            <FloatingTrigger />
            <div className="flex flex-col h-screen">
              <ChatMessages />
              <RemainingMessagesAlert />
              <ChatInput />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
