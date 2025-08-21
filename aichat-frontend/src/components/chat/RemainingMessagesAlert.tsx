"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";

export default function RemainingMessagesAlert() {
    const [isVisible, setIsVisible] = useState(false);
    const remainingMessages = useChatStore((s) => s.remainingMessages);

    useEffect(() => {
        if (remainingMessages !== null && remainingMessages !== undefined) {
            setIsVisible(true);
        }
    }, [remainingMessages]);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible || remainingMessages === null || remainingMessages === undefined) {
        return null;
    }

    return (
        <div className="fixed bottom-3 left-0 right-0 z-10">
            <div className="max-w-4xl mx-auto px-2">
                <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/30 rounded-xl p-3 mx-auto max-w-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                            <span className="text-amber-200 text-sm font-medium">
                                {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining
                            </span>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-amber-300 hover:text-amber-100 transition-colors duration-200 p-1 rounded-full hover:bg-amber-400/20"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}