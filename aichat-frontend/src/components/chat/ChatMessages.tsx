"use client";
import { useChatStore } from "@/stores/chatStore";
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import React, { useEffect, useRef, useState } from 'react'
import { Copy, Check, ChevronDown } from 'lucide-react'

// Typing indicator component
const TypingIndicator = () => {
    return (
        <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl px-4 py-3 shadow text-gray-300 rounded-bl-none bg-[#1a1a2e]/50 border border-gray-700/30">
                <div className="flex items-center space-x-2">
                    <span className="text-sm opacity-70">AI is typing</span>
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ChatMessages() {
    const messages = useChatStore((s) => s.messages);
    const isAiTyping = useChatStore((s) => s.isAiTyping);
    const MemoizedMarkdown = React.memo(MarkdownRenderer);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiTyping]);

    // Handle scroll to show/hide scroll to bottom button
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
            setShowScrollButton(!isNearBottom && messages.length > 0);
        }
    };

    const copyToClipboard = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="relative h-[100vh] bg-[#01172f]">
            <div 
                ref={messagesContainerRef}
                className="flex flex-col space-y-3 p-4 pb-32 overflow-y-auto h-full custom-scrollbar"
                onScroll={handleScroll}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 shadow relative group
                  ${msg.role === "user"
                                ? "bg-[#1c4570] text-gray-300 rounded-br-none"
                                : "text-gray-300 rounded-bl-none"}`}
                        >
                            <MemoizedMarkdown content={msg.content} />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(msg.content, msg.id)}
                                    className=" duration-200 p-1 rounded hover:bg-white/10"
                                    title="Copy message"
                                >
                                    {copiedMessageId === msg.id ? (
                                        <Check className="w-3 h-3 text-green-400" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-gray-300" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Show typing indicator when AI is typing */}
                {isAiTyping && <TypingIndicator />}
                
                <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-40 right-6 bg-[#1c4570] hover:bg-[#2a5a89] text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10 border border-gray-600"
                    title="Scroll to bottom"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}