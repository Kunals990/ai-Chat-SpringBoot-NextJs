"use client";
import Image from "next/image";

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
import { useRouter } from "next/navigation";

export default function UserFooterMenu() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/");
        };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {isAuthenticated ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="h-8 px-3 rounded-lg hover:bg-[#123254]">
                                {user?.profile_photo ? (
                                    <Image
                                        src={user?.profile_photo || "/default-avatar.png"}
                                        alt={user?.name || "User"}
                                        width={24}
                                        height={24}
                                        className="h-6 w-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <User2 className="h-5 w-5 text-white" />
                                )}
                                <span className="font-medium text-white">
                                    {user?.name || "User"}
                                </span>
                                <ChevronUp className="ml-auto h-4 w-4 text-gray-400" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side="top"
                            className="w-[--radix-popper-anchor-width] bg-[#0B2D52] border border-gray-200 rounded-xl shadow-lg p-2 min-w-[200px]"
                        >
                            <DropdownMenuItem className="px-4 py-3 text-sm cursor-pointer rounded-lg transition-colors flex items-center gap-3">
                                <Settings className="h-4 w-4 text-white" />
                                <span className="text-white hover:text-black">Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="px-4 py-3 text-sm hover:bg-[#01172f] cursor-pointer rounded-lg text-white flex items-center gap-3 transition-colors "
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
