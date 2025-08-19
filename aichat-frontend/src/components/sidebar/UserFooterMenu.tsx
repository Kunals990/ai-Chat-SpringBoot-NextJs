"use client";

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // shadcn import
import { ChevronUp, Settings, LogOut, User2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function UserFooterMenu() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {isAuthenticated ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="h-12 px-3 hover:bg-gray-50 transition-colors rounded-lg">
                                {user?.picture ? (
                                    <img
                                        src={user.picture}
                                        alt={user.name || "User"}
                                        className="h-6 w-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <User2 className="h-5 w-5 text-gray-600" />
                                )}
                                <span className="font-medium text-gray-700">
                                    {user?.name || "User"}
                                </span>
                                <ChevronUp className="ml-auto h-4 w-4 text-gray-400" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side="top"
                            className="w-[--radix-popper-anchor-width] bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[200px]"
                        >
                            <DropdownMenuItem className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer rounded-lg transition-colors flex items-center gap-3">
                                <Settings className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={logout}
                                className="px-4 py-3 text-sm hover:bg-red-50 cursor-pointer rounded-lg text-red-600 flex items-center gap-3 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <SidebarMenuButton asChild>
                        <a
                            href="/login"
                            className="flex items-center gap-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors rounded-lg h-12 px-3"
                        >
                            <User2 className="h-5 w-5" />
                            <span>Please Login</span>
                        </a>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
