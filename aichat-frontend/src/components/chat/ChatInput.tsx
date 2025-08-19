"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useAuthStore } from "@/stores/authStore";
import LoginPopup from "../LoginPopup";
import {useLlmStore} from "@/stores/llmStore";
import LlmSelector from "@/components/chat/LlmSelector";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function ChatInput() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const selectedLlm = useLlmStore((s) => s.selectedLlm);

    const addMessage = useChatStore((s) => s.addMessage);
    const addSessions = useSessionStore((s) => s.addSessions);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const messages = useChatStore((s) => s.messages);

    const sendMessage = async () => {
        if (!text.trim() || loading) return;

        if (!isAuthenticated) {
            setShowLoginPopup(true);
            return;
        }

        const sessionId = sessionStorage.getItem("session_id") || (await createNewSession());

        const userMessage = {
            id: Date.now().toString(),
            content: text,
            role: "user",
            timestamp: new Date(),
        };
        addMessage(userMessage);

        setLoading(true);
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

            const res = await fetch(`${backendUrl}/chat/llm`, {
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

            if (!sessionStorage.getItem("session_id")) {
                sessionStorage.setItem("session_id", sessionId);
                addSessions({
                    id: sessionId,
                    sessionName: "New Chat",
                    timestamp: new Date().toISOString(),
                });
            }
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
        }
    };

    const createNewSession = async () => {
        const res = await fetch(`${backendUrl}/chat/session`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        return data.id;
    };

    return (
        <div className="flex items-center border-t p-3">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={isAuthenticated ? "Type a message..." : "Login to start chatting..."}
                disabled={loading || !isAuthenticated}
                className="flex-1 border rounded-lg px-3 py-2 mr-2"
            />
            <button
                onClick={sendMessage}
                disabled={!text.trim() || loading || !isAuthenticated}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
                {loading ? "..." : <Send className="w-4 h-4" />}
            </button>
            <LlmSelector/>
            {/* Login Popup */}
            <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
        </div>
    );
}
