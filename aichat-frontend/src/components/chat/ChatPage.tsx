import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-screen">
            <ChatMessages />
            <ChatInput />
        </div>
    );
}
