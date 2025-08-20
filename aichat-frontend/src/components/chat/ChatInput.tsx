"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import LoginPopup from "../LoginPopup";
import {useLlmStore} from "@/stores/llmStore";
import LlmSelector from "@/components/chat/LlmSelector";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchWithAuth"; 

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatInput() {
    const router = useRouter(); 

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const selectedLlm = useLlmStore((s) => s.selectedLlm);

    const addMessage = useChatStore((s) => s.addMessage);
    const addSessions = useSessionStore((s) => s.addSessions);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const setIsAiTyping = useChatStore((s) => s.setIsAiTyping);

    const messages = useChatStore((s) => s.messages);

    const sendMessage = async () => {
        if (!text.trim() || loading) return;

        if (!isAuthenticated) {
            setShowLoginPopup(true);
            return;
        }

        const sessionId = sessionStorage.getItem("session_id") || (await createNewSession());

        const userMessage: Message = {
            id: Date.now().toString(),
            content: text,
            role: "user", 
            timestamp: new Date(),
            };
        addMessage(userMessage);

        setLoading(true);
        setIsAiTyping(true);
        setText("");

        try {
            const payload = {
                messages: [...messages, userMessage].map((m) => ({
                    role: m.role,
                    parts: [{ text: m.content }],
                })),
                LLM: selectedLlm,
                session: { id: sessionId },
            };

            const res = await fetchWithAuth(`${backendUrl}/chat/llm`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to send message");

            const data = await res.json();

            addMessage({
                id: (Date.now() + 1).toString(),
                content: data.message,
                role: "assistant",
                timestamp: new Date(),
            });
            router.push(`/chat/${sessionId}`);

        } catch (err) {
            addMessage({
                id: (Date.now() + 1).toString(),
                content: "⚠️ Error talking to server. Try again.",
                role: "assistant",
                timestamp: new Date(),
            });
            console.log(err);
        } finally {
            setLoading(false);
            setIsAiTyping(false);
        }
    };

    const createNewSession = async () => {
        const res = await fetchWithAuth(`${backendUrl}/chat/session`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        sessionStorage.setItem("session_id", data.id);
        addSessions({
            id: data.id,
            sessionName: "New Chat",
            timestamp: new Date().toISOString(),
        });
        return data.id;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-transparent p-2">
            <div className="max-w-4xl mx-auto">
                <div className="relative bg-[#01172f]/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
                    {/* Model Selector inside the input box */}
                    <div className="flex items-center mb-3">
                        <LlmSelector/>
                    </div>
                    
                    <div className="relative flex items-end">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder={isAuthenticated ? "Message AI..." : "Login to start chatting..."}
                            disabled={loading || !isAuthenticated}
                            rows={1}
                            className="flex-1 bg-transparent border-none outline-none resize-none pr-12 py-2 text-white placeholder-gray-400 max-h-40 min-h-[40px] overflow-y-auto text-base"
                            style={{ 
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#cbd5e0 transparent'
                            }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 160) + 'px';
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!text.trim() || loading || !isAuthenticated}
                            className={`absolute right-0 bottom-0 p-2.5 rounded-full transition-all duration-200 ${
                                text.trim() && !loading && isAuthenticated
                                    ? 'bg-blue-600/80 text-white hover:bg-blue-700/90 shadow-sm backdrop-blur-sm'
                                    : 'bg-gray-500/50 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                            }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {/* Login Popup */}
            <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
        </div>
    );
}