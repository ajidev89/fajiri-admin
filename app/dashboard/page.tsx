"use client";

import * as React from "react";
import DashboardLayout from "@/layout/dashboard";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    Heart,
    Megaphone,
    Users,
    Receipt,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics";
import { useAuthStore } from "@/store/auth-store";



export default function DashboardPage() {
    const { user } = useAuthStore();
    const isFundraiser = user?.role.slug === "fundraiser";
    const filterParams = isFundraiser ? { added_by: user?.id } : {};

    const {
        data: analyticsRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["analytics", isFundraiser ? user?.id : "all"],
        queryFn: () => analyticsService.getAnalytics(filterParams),
    });

    const {
        data: topPerformingCampaignsRes,
        isLoading: topPerformingCampaignsIsLoading,
        error: topPerformingCampaignsError,
    } = useQuery({
        queryKey: ["top-performing-campaigns", isFundraiser ? user?.id : "all"],
        queryFn: () => analyticsService.getTopPerformingCampaigns(filterParams),
    });

    const { data: donationChartlyAnnualyRes } = useQuery({
        queryKey: ["donation-chartly-annualy", isFundraiser ? user?.id : "all"],
        queryFn: () => analyticsService.getDonationChartlyAnnualy(filterParams),
    });

    const analytics = React.useMemo(
        () => analyticsRes?.data || null,
        [analyticsRes],
    );

    const topPerformingCampaigns = React.useMemo(
        () => (Array.isArray(topPerformingCampaignsRes?.data) ? topPerformingCampaignsRes.data : []),
        [topPerformingCampaignsRes],
    );

    const donationChartlyAnnualy = React.useMemo(
        () => (Array.isArray(donationChartlyAnnualyRes?.data) ? donationChartlyAnnualyRes.data : []),
        [donationChartlyAnnualyRes],
    );

    const stats = React.useMemo(() => {
        if (!analytics) return [];

        const allStats = [
            {
                label: "Total Donations",
                value: analytics.total_donations_amount?.[0] ? `${analytics.total_donations_amount[0].currency}${Number(analytics.total_donations_amount[0].total_amount).toLocaleString()}` : "0",
                trend: "0%", // Replace if backend provides change %
                trendUp: true,
                icon: Heart,
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
            },
            {
                label: "Active Campaigns",
                value: analytics.active_campaigns?.toLocaleString() || "0",
                trend: `${analytics.active_campaigns_percentage_change > 0 ? "+" : ""}${analytics.active_campaigns_percentage_change || 0}%`,
                trendUp: analytics.active_campaigns_percentage_change >= 0,
                icon: Megaphone,
                iconBg: "bg-orange-50",
                iconColor: "text-orange-600",
            },
            {
                label: "Total Members",
                value: analytics.total_users?.toLocaleString() || "0",
                trend: `${analytics.total_users_percentage_change > 0 ? "+" : ""}${analytics.total_users_percentage_change || 0}%`,
                trendUp: analytics.total_users_percentage_change >= 0,
                icon: Users,
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
            },
            {
                label: "Active Needs",
                value: analytics.active_needs?.toLocaleString() || "0",
                trend: `${analytics.active_needs_percentage_change > 0 ? "+" : ""}${analytics.active_needs_percentage_change || 0}%`,
                trendUp: analytics.active_needs_percentage_change >= 0,
                icon: Receipt,
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
            },
        ];

        // Remove "Total Members" for fundraisers
        if (isFundraiser) {
            return allStats.filter(s => s.label !== "Total Members");
        }

        return allStats;
    }, [analytics, isFundraiser]);

    const trendData = React.useMemo(() => {
        return donationChartlyAnnualy.map(d => ({
            month: d.month.substring(0, 3), // Short month
            raised: Object.values(d.amounts)[0] || 0, // Fallback to first currency
            donations: d.no_of_donations || 0
        }));
    }, [donationChartlyAnnualy]);

    const campaignColors = ["#0E3B5D", "#1D4ED8", "#60A5FA", "#93C5FD", "#BFDBFE"];
    const campaignData = React.useMemo(() => {
        return topPerformingCampaigns.slice(0, 5).map((c, i) => ({
            name: c.title,
            value: Number(c.total_raised),
            color: campaignColors[i % campaignColors.length]
        }));
    }, [topPerformingCampaigns]);

    const totalCampaignRaised = React.useMemo(() => {
        return campaignData.reduce((acc, curr) => acc + curr.value, 0);
    }, [campaignData]);

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#101828]">
                            Dashboard
                        </h2>
                        <p className="text-sm text-[#475467]">
                            Overview of platform activities.
                        </p>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-6",
                    isFundraiser ? "lg:grid-cols-3" : "lg:grid-cols-4"
                )}>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-2xl border border-[#EAECF0] shadow-sm space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div
                                    className={cn(
                                        "p-2.5 rounded-xl",
                                        stat.iconBg,
                                    )}
                                >
                                    <stat.icon
                                        className={cn(
                                            "h-5 w-5",
                                            stat.iconColor,
                                        )}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-[#667085]">
                                    {stat.label}
                                </span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-xl font-bold text-[#101828]">
                                    {stat.value}
                                </h3>
                                <div
                                    className={cn(
                                        "flex items-center gap-1 text-xs font-bold",
                                        stat.trendUp
                                            ? "text-green-600"
                                            : "text-red-600",
                                    )}
                                >
                                    {stat.trendUp ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    <span>{stat.trend}</span>
                                    <span className="text-[#667085] font-normal ml-0.5">
                                        from last month
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
