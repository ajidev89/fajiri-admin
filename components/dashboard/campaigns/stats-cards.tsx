"use client";

import { cn } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Megaphone,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/services/campaigns";
import { useAuthStore } from "@/store/auth-store";

const stats = [
    {
        title: "Active Campaigns",
        value: "1,590",
        change: "+2.0%",
        trend: "up",
        icon: Megaphone,
        bgColor: "bg-[#0E3B5D]/10",
        iconColor: "text-[#0E3B5D]",
    },
    {
        title: "Pending Campaigns",
        value: "40",
        change: "-2.0%",
        trend: "down",
        icon: Clock,
        bgColor: "bg-[#F79009]/10",
        iconColor: "text-[#F79009]",
    },
    {
        title: "Completed Campaigns",
        value: "956",
        change: "+2.0%",
        trend: "up",
        icon: CheckCircle,
        bgColor: "bg-[#12B76A]/10",
        iconColor: "text-[#12B76A]",
    },
    {
        title: "Rejected Campaigns",
        value: "32",
        change: "-2.0%",
        trend: "down",
        icon: XCircle,
        bgColor: "bg-[#F04438]/10",
        iconColor: "text-[#F04438]",
    },
];

export function CampaignStats() {
    const { user } = useAuthStore();
    const isFundraiser = user?.role.slug === "fundraiser";

    const { data: analytics } = useQuery({
        queryKey: ["campaign-analytics", isFundraiser ? user?.id : "all"],
        queryFn: () => campaignService.getAnalytics(isFundraiser ? { added_by: user?.id } : {}),
    });

    const stats = [
        {
            title: "Active Campaigns",
            value: analytics?.data.active_campaigns,
            change: analytics?.data.active_percentage_change,
            trend: (analytics?.data?.active_percentage_change ?? 0) > 0 ? "up" : "down",
            icon: Megaphone,
            bgColor: "bg-[#0E3B5D]/10",
            iconColor: "text-[#0E3B5D]",
        },
        {
            title: "Pending Campaigns",
            value: analytics?.data.pending_campaigns,
            change: analytics?.data.pending_percentage_change,
            trend:
                (analytics?.data?.pending_percentage_change ?? 0) > 0 ? "up" : "down",
            icon: Clock,
            bgColor: "bg-[#F79009]/10",
            iconColor: "text-[#F79009]",
        },
        {
            title: "Completed Campaigns",
            value: analytics?.data.completed_campaigns,
            change: analytics?.data.completed_percentage_change,
            trend:
                (analytics?.data?.completed_percentage_change ?? 0) > 0
                    ? "up"
                    : "down",
            icon: CheckCircle,
            bgColor: "bg-[#12B76A]/10",
            iconColor: "text-[#12B76A]",
        },
        {
            title: "Rejected Campaigns",
            value: analytics?.data.rejected_campaigns,
            change: analytics?.data.rejected_percentage_change,
            trend:
                (analytics?.data?.rejected_percentage_change ?? 0) > 0 ? "up" : "down",
            icon: XCircle,
            bgColor: "bg-[#F04438]/10",
            iconColor: "text-[#F04438]",
        },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className="bg-white p-6 rounded-2xl border border-[#EAECF0] shadow-sm flex flex-col gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-full", stat.bgColor)}>
                            <stat.icon
                                className={cn("h-6 w-6", stat.iconColor)}
                            />
                        </div>
                        <span className="text-sm font-medium text-[#667085]">
                            {stat.title}
                        </span>
                    </div>

                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-[#101828]">
                            {stat.value}
                        </span>
                        <div className="text-right">
                            <span
                                className={cn(
                                    "text-xs font-semibold flex items-center gap-1",
                                    stat.trend === "up"
                                        ? "text-[#12B76A]"
                                        : "text-[#F04438]",
                                )}
                            >
                                {stat.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {stat.change}
                            </span>
                            <span className="text-[10px] text-[#667085]">
                                from last month
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
