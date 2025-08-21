"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Branding from "./Branding";
import NewChatButton from "./NewChatButton";
import SessionsList from "./SessionsList";
import UserFooterMenu from "./UserFooterMenu";

export default function NewAppSidebar() {
    return (
        <Sidebar className="border-r border-[#f1f5f9] bg-[#01172F]">
            <SidebarContent className="bg-[#01172F]">
                <SidebarGroup className="custom-scrollbar">
                    <Branding />
                </SidebarGroup>

                <SidebarGroup className="px-3 py-2">
                    <NewChatButton />
                </SidebarGroup>

                <SidebarGroup className="flex-1 overflow-hidden px-3 scrollbar-track-transparent">
                    <SidebarGroupLabel className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-2">
                        Recent Chats
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="flex-1 overflow-hidden custom-scrollbar ">
                        <SessionsList />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-[#01172f] pb-3 bg-[#01172f]">
                <UserFooterMenu />
            </SidebarFooter>
        </Sidebar>
    );
}
