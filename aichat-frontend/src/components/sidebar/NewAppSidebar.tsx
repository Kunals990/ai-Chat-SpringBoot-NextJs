/* eslint-disable @typescript-eslint/no-explicit-any */
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
        <Sidebar className="border-r border-gray-100 bg-white">
            <SidebarContent className="bg-white">
                <SidebarGroup>
                    <Branding />
                </SidebarGroup>

                <SidebarGroup className="px-3 py-2">
                    <NewChatButton />
                </SidebarGroup>

                <SidebarGroup className="flex-1 overflow-hidden px-3">
                    <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Recent Chats
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="flex-1 overflow-hidden">
                        <SessionsList />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-100 p-3 space-y-2">
                <UserFooterMenu />
            </SidebarFooter>
        </Sidebar>
    );
}
