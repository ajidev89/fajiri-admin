"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Navbar() {
    const pathname = usePathname();
    
    // Simple logic to get page title from pathname
    const getPageTitle = (path: string) => {
        const segments = path.split("/").filter(Boolean);
        if (segments.length === 0) return "Dashboard";
        const lastSegment = segments[segments.length - 1];
        return lastSegment.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    const title = getPageTitle(pathname);

    return (
        <header className="h-20 border-b border-[#E9EEF2] bg-white flex items-center justify-between px-8 sticky top-0 z-40">
            <h1 className="text-xl font-bold text-[#101828]">{title}</h1>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative hidden md:block w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#EAECF0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0E3B5D] transition-all"
                    />
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-[#667085] hover:bg-[#F9FAFB] rounded-full transition-colors relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#F04438] rounded-full border-2 border-white"></span>
                    </button>
                    
                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-[#E9EEF2]">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-[#101828]">Super Admin</p>
                            <p className="text-xs text-[#667085]">System User</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center border border-[#EAECF0]">
                            <span className="text-sm font-semibold text-[#475467]">SA</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-[#667085] cursor-pointer" />
                    </div>
                </div>
            </div>
        </header>
    );
}
