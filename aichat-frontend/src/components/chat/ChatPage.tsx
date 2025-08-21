import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import RemainingMessagesAlert from "./RemainingMessagesAlert";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-screen">
            <ChatMessages />
            <RemainingMessagesAlert/>
            <ChatInput />
        </div>
    );
}
