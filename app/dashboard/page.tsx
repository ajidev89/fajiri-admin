"use client"

import * as React from "react"
import DashboardLayout from "@/layout/dashboard"
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
    Legend
} from "recharts"
import { 
    Heart, 
    Megaphone, 
    Users, 
    Receipt, 
    TrendingUp, 
    TrendingDown,
    ChevronDown,
    RotateCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Mock data for trend chart
const trendData = [
    { month: "Jan", raised: 200, donations: 120 },
    { month: "Feb", raised: 280, donations: 180 },
    { month: "Mar", raised: 250, donations: 150 },
    { month: "Apr", raised: 320, donations: 220 },
    { month: "May", raised: 380, donations: 280 },
    { month: "Jun", raised: 350, donations: 240 },
    { month: "Jul", raised: 410, donations: 310 },
    { month: "Aug", raised: 450, donations: 340 },
    { month: "Sep", raised: 420, donations: 310 },
    { month: "Oct", raised: 390, donations: 290 },
    { month: "Nov", raised: 460, donations: 360 },
    { month: "Dec", raised: 380, donations: 280 },
]

// Mock data for donut chart
const campaignData = [
    { name: "Help Mia Walk Again", value: 270000, color: "#0E3B5D" },
    { name: "Education for Refugees", value: 180000, color: "#1D4ED8" },
    { name: "Books for Rural Kids", value: 50000, color: "#60A5FA" },
]

const stats = [
    {
        label: "Total Donations",
        value: "₦500,000",
        trend: "+2.0%",
        trendUp: true,
        icon: Heart,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600"
    },
    {
        label: "Active Campaigns",
        value: "1,590",
        trend: "-2.0%",
        trendUp: false,
        icon: Megaphone,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600"
    },
    {
        label: "Total Members",
        value: "247",
        trend: "+2.0%",
        trendUp: true,
        icon: Users,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600"
    },
    {
        label: "Pending Withdrawals",
        value: "₦590,045",
        trend: "-2.0%",
        trendUp: false,
        icon: Receipt,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600"
    }
]

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#101828]">Dashboard</h2>
                        <p className="text-sm text-[#475467]">Overview of platform activities.</p>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-[#EAECF0] shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={cn("p-2.5 rounded-xl", stat.iconBg)}>
                                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                                </div>
                                <span className="text-xs font-semibold text-[#667085]">{stat.label}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-xl font-bold text-[#101828]">{stat.value}</h3>
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-bold",
                                    stat.trendUp ? "text-green-600" : "text-red-600"
                                )}>
                                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    <span>{stat.trend}</span>
                                    <span className="text-[#667085] font-normal ml-0.5">from last month</span>
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
                            <h4 className="font-bold text-[#101828]">Monthly Donations Trend</h4>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="h-8 border-[#EAECF0] text-[#344054] text-xs font-semibold gap-2">
                                    Monthly <ChevronDown className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 border-[#EAECF0] text-[#667085]">
                                    <RotateCw className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#0E3B5D]" />
                                <span className="text-[#475467] font-medium text-[11px]">Amount Raised</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#F04438]" />
                                <span className="text-[#475467] font-medium text-[11px]">Donations Count</span>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
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
                                        tickFormatter={(value) => `₦${value}k`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: "12px", border: "1px solid #EAECF0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="raised" 
                                        stroke="#0E3B5D" 
                                        strokeWidth={2} 
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0, fill: "#0E3B5D" }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="donations" 
                                        stroke="#F04438" 
                                        strokeWidth={2} 
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0, fill: "#F04438" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart Card */}
                    <div className="bg-white p-6 rounded-3xl border border-[#EAECF0] shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[#101828]">Top Performing Campaigns</h4>
                            <Button variant="outline" size="icon" className="h-8 w-8 border-[#EAECF0] text-[#667085]">
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
                                            {campaignData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-[#101828]">₦500,000</span>
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                {campaignData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-medium text-[#475467]">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-[#101828]">₦{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}
