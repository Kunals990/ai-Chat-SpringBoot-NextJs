"use client";
import { useChatStore } from "@/stores/chatStore";
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import React from 'react'

export default function ChatMessages() {
    const messages = useChatStore((s) => s.messages);
    const MemoizedMarkdown = React.memo(MarkdownRenderer);

    return (
        <div className="flex flex-col space-y-3 p-4 overflow-y-auto h-[70vh]">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                    <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow 
              ${msg.role === "user"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"}`}
                    >
                        <MemoizedMarkdown content={msg.content} />
                        <span className="text-xs opacity-70 block mt-1">
  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
