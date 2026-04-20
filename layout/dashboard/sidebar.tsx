"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Megaphone,
    Heart,
    Users,
    UserSquare,
    FileText,
    BarChart3,
    Receipt,
    ScrollText,
    Settings,
    HelpCircle,
    LogOut,
    HeartHandshake,
    CreditCard,
    Library,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import Image from "next/image";

const sidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Campaigns", icon: Megaphone, href: "/dashboard/campaigns" },
    { label: "Needs", icon: HeartHandshake, href: "/dashboard/needs" },
    { label: "Plans", icon: CreditCard, href: "/dashboard/plans" },
    { label: "Donations", icon: Heart, href: "/dashboard/donations" },
    { label: "Users", icon: Users, href: "/dashboard/users" },
    { label: "Fundraiser", icon: UserSquare, href: "/dashboard/fundraiser" },
    { label: "Content Management", icon: FileText, href: "/dashboard/content" },
    {
        label: "Reports & Analytics",
        icon: BarChart3,
        href: "/dashboard/reports",
    },
    { label: "Disbursements", icon: Receipt, href: "/dashboard/disbursements" },
];

const bottomSidebarItems = [
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    {
        label: "Help & Support",
        icon: HelpCircle,
        href: "/dashboard/help-support",
    },
    { label: "Logout", icon: LogOut, href: "/logout" },
];

import { useSidebar } from "@/layout/dashboard/index";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { isOpen, setIsOpen } = useSidebar();
    const clearAuthData = useAuthStore((state) => state.clearAuthData);

    const isFundraiser = user?.role.slug === "fundraiser";

    const filteredSidebarItems = React.useMemo(() => {
        if (!isFundraiser) return sidebarItems;
        return sidebarItems.filter((item) =>
            ["Dashboard", "Campaigns", "Needs"].includes(item.label),
        );
    }, [isFundraiser]);

    const filteredBottomItems = React.useMemo(() => {
        if (!isFundraiser) return bottomSidebarItems;
        return bottomSidebarItems.filter((item) =>
            ["Settings", "Logout"].includes(item.label),
        );
    }, [isFundraiser]);

    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSettled: () => {
            // Always clear data and redirect even if the API call fails
            Cookies.remove("fajiri_token");
            clearAuthData();
            router.push("/login");
        },
    });

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logoutMutation.mutate();
    };

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname, setIsOpen]);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen w-64 border-r border-[#E9EEF2] bg-white flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
            )}
        >
            {/* Logo Section */}
            <div className="p-6 border-b border-[#E9EEF2] h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        className="w-[120px] sm:w-[128px]"
                        width={128}
                        height={128}
                    />
                </div>
                {/* Close button for mobile */}
                <button
                    className="p-2 lg:hidden text-[#667085] hover:bg-[#F9FAFB] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {filteredSidebarItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-[#F0F5F9] text-primary"
                                    : "text-[#475467] hover:bg-[#F9FAFB] hover:text-primary",
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-[#475467] group-hover:text-primary",
                                )}
                            />
                            <span>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-[#E9EEF2] space-y-2">
                {filteredBottomItems.map((item) => {
                    const isActive = pathname === item.href;
                    if (item.label === "Logout") {
                        return (
                            <button
                                key={item.label}
                                onClick={handleLogout}
                                disabled={logoutMutation.isPending}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group text-[#F04438] hover:bg-[#FFF4F3] disabled:opacity-50",
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 transition-colors text-[#F04438]",
                                    )}
                                />
                                <span>
                                    {logoutMutation.isPending
                                        ? "Logging out..."
                                        : "Logout"}
                                </span>
                            </button>
                        );
                    }
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-[#F0F5F9] text-primary"
                                    : "text-[#475467] hover:bg-[#F9FAFB] hover:text-primary",
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-[#475467] group-hover:text-primary",
                                )}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
