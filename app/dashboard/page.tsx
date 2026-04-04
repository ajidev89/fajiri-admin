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



export default function DashboardPage() {
    const {
        data: analyticsRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["analytics"],
        queryFn: () => analyticsService.getAnalytics(),
    });

    const {
        data: topPerformingCampaignsRes,
        isLoading: topPerformingCampaignsIsLoading,
        error: topPerformingCampaignsError,
    } = useQuery({
        queryKey: ["top-performing-campaigns"],
        queryFn: () => analyticsService.getTopPerformingCampaigns(),
    });

    const { data: donationChartlyAnnualyRes } = useQuery({
        queryKey: ["donation-chartly-annualy"],
        queryFn: () => analyticsService.getDonationChartlyAnnualy(),
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

        return [
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
    }, [analytics]);

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                    {/* Trend Chart Card */}
                    <div className="bg-white p-6 rounded-3xl border border-[#EAECF0] shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[#101828]">
                                Monthly Donations Trend
                            </h4>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 border-[#EAECF0] text-[#344054] text-xs font-semibold gap-2"
                                >
                                    Monthly <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 border-[#EAECF0] text-[#667085]"
                                >
                                    <RotateCw className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#0E3B5D]" />
                                <span className="text-[#475467] font-medium text-[11px]">
                                    Amount Raised
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#F04438]" />
                                <span className="text-[#475467] font-medium text-[11px]">
                                    Donations Count
                                </span>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#F2F4F7"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#667085", fontSize: 11 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#667085", fontSize: 11 }}
                                        tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #EAECF0",
                                            boxShadow:
                                                "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="raised"
                                        stroke="#0E3B5D"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{
                                            r: 4,
                                            strokeWidth: 0,
                                            fill: "#0E3B5D",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="donations"
                                        stroke="#F04438"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{
                                            r: 4,
                                            strokeWidth: 0,
                                            fill: "#F04438",
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart Card */}
                    <div className="bg-white p-6 rounded-3xl border border-[#EAECF0] shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[#101828]">
                                Top Performing Campaigns
                            </h4>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-[#EAECF0] text-[#667085]"
                            >
                                <RotateCw className="h-3 w-3" />
                            </Button>
                        </div>

                        <div className="h-[400px] flex flex-col items-center justify-center gap-8">
                            <div className="relative h-64 w-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={campaignData}
                                            innerRadius={75}
                                            outerRadius={100}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {campaignData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-[#101828]">
                                        ₦{totalCampaignRaised.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                {campaignData.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                            <span className="text-sm font-medium text-[#475467] truncate max-w-[180px]">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-[#101828]">
                                            ₦{item.value.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
