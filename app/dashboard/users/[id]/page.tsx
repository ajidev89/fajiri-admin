"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Phone,
    UserPlus,
    Clock,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { UserWithWallet, usersService } from "@/services/users";

const accountActivity = [
    {
        title: "User logged into the platform.",
        time: "22 Feb 2026 • 10:45 AM",
        details: "IP Address: 102.89.45.12",
        type: "info",
    },
    {
        title: "Failed login attempt due to incorrect password.",
        time: "22 Feb 2026 • 10:30 AM",
        details: "IP Address: 102.89.45.12",
        type: "warning",
    },
    {
        title: "5 consecutive failed login attempts detected.",
        time: "22 Feb 2026 • 10:35 AM",
        details: "Flagged by: System",
        type: "error",
    },
    {
        title: "User requested a password reset link.",
        time: "20 Feb 2026 • 08:12 PM",
        details: "Performed by: User",
        type: "info",
    },
    {
        title: "Password was successfully changed.",
        time: "20 Feb 2026 • 08:18 PM",
        details: "Performed by: User",
        type: "success",
    },
    {
        title: "Admin sent a password reset link.",
        time: "19 Feb 2026 • 04:05 PM",
        details: "Performed by: Admin - Daniel",
        type: "admin",
    },
];

export default function UserDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const {
        data: userRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["user", id],
        queryFn: () => usersService.getUserById(id),
    });

    const user = userRes?.data;

    console.log(user);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            href="/dashboard/users"
                            className="text-[#667085] hover:text-primary transition-colors"
                        >
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">
                            User Details
                        </span>
                    </div>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            href="/dashboard/users"
                            className="text-[#667085] hover:text-primary transition-colors"
                        >
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">
                            User Details
                        </span>
                    </div>
                    <div className="flex items-center justify-center h-64">
                        <p className="text-red-500">Failed to load user data</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                    <Link
                        href="/dashboard/users"
                        className="text-[#667085] hover:text-primary transition-colors"
                    >
                        Back
                    </Link>
                    <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                    <span className="font-semibold text-[#101828]">
                        User Details
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
                    {/* Left Sidebar - Profile Information */}
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm p-8 text-center flex flex-col items-center gap-4">
                            <Avatar className="h-24 w-24 ring-4 ring-gray-50 ring-offset-0">
                                <AvatarImage
                                    src={user?.profile.avatar ?? ""}
                                    alt={user?.profile.first_name}
                                />
                                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                                    {user?.profile.first_name?.charAt(0)}{" "}
                                    {user?.profile.last_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-[#101828]">
                                    {user?.profile.first_name}{" "}
                                    {user?.profile.last_name}
                                </h3>
                                <p className="text-sm text-[#475467]">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Basic Information Card */}
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828]">
                                    Basic Information
                                </h4>
                            </div>
                            <div className="p-8 space-y-6">
                                <InfoItem label="Member ID" value={user?.id} />
                                <InfoItem
                                    label="Account Plan"
                                    value={user?.account_type ?? ""}
                                />
                                {/* <InfoItem
                                    label="Expiration Date"
                                    value={user?.expiration_date}
                                /> */}
                                <InfoItem
                                    label="Phone Number"
                                    value={userData.phone}
                                />
                                <InfoItem
                                    label="Role"
                                    value={user?.role?.name ?? ""}
                                />
                                <InfoItem
                                    label="Date Joined"
                                    value={user?.created_at ?? ""}
                                />
                                <InfoItem
                                    label="Last Active"
                                    value={user?.last_login_at ?? ""}
                                />
                            </div>
                        </div>

                        {/* Profile Status Card */}
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828]">
                                    Profile Status
                                </h4>
                            </div>
                            <div className="p-8 space-y-6">
                                <StatusItem
                                    label="Status"
                                    value={user?.status ?? ""}
                                    icon={
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                    }
                                />
                                <StatusItem
                                    label="Email Verified"
                                    value={
                                        user?.email_verified_at ? "Yes" : "No"
                                    }
                                    icon={
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    }
                                />
                                <StatusItem
                                    label="KYC Verified"
                                    value="Yes"
                                    icon={
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    }
                                />
                                <InfoItem
                                    label="Last Password Change"
                                    value={user?.last_password_change ?? ""}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Activity Tabs */}
                    <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden min-h-[600px]">
                        <Tabs
                            defaultValue="account"
                            className="w-full h-full flex flex-col"
                        >
                            <div className="px-8 pt-6 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828] mb-6">
                                    Activity
                                </h4>
                                <TabsList className="h-auto bg-transparent p-0 gap-8 justify-start border-none">
                                    <TabsTrigger
                                        value="account"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Account
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="campaign"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Campaign
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="financial"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Financial
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent
                                value="account"
                                className="flex-1 p-8 focus-visible:ring-0"
                            >
                                <div className="space-y-8 relative">
                                    {/* Vertical line connector */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#EAECF0] ml-0.5" />

                                    {accountActivity.map((log, index) => (
                                        <div
                                            key={index}
                                            className="pl-8 relative group"
                                        >
                                            {/* Dot on the line */}
                                            <div className="absolute left-[-3px] top-1.5 h-2 w-2 rounded-full bg-[#EAECF0] ring-4 ring-white" />
                                            <div className="space-y-2">
                                                <p className="text-[#101828] font-medium leading-tight">
                                                    {log.title}
                                                </p>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-[#475467]">
                                                        {log.time}
                                                    </p>
                                                    <p className="text-xs text-[#667085]">
                                                        {log.details}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="campaign"
                                className="p-8 flex items-center justify-center text-[#667085] h-64 focus-visible:ring-0"
                            >
                                No campaign activity recorded.
                            </TabsContent>

                            <TabsContent
                                value="financial"
                                className="p-8 flex items-center justify-center text-[#667085] h-64 focus-visible:ring-0"
                            >
                                No financial activity recorded.
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#667085]">{label}:</span>
            <span className="font-bold text-[#101828] text-right">{value}</span>
        </div>
    );
}

function StatusItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#667085]">{label}:</span>
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-bold text-[#101828]">{value}</span>
            </div>
        </div>
    );
}
