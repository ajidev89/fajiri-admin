"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, MinusCircle, CheckCircle, XCircle } from "lucide-react";

const stats = [
    {
        title: "Available Funds",
        value: "₦24,500,000",
        change: "+2.0%",
        trend: "up",
        icon: Wallet,
        bgColor: "bg-[#0E3B5D]/10",
        iconColor: "text-[#0E3B5D]",
    },
    {
        title: "Pending Disbursements",
        value: "₦500,000",
        change: "-2.0%",
        trend: "down",
        icon: MinusCircle,
        bgColor: "bg-[#344054]/10",
        iconColor: "text-[#344054]",
    },
    {
        title: "Approved Disbursements",
        value: "₦200,000",
        change: "+2.0%",
        trend: "up",
        icon: CheckCircle,
        bgColor: "bg-[#12B76A]/10",
        iconColor: "text-[#12B76A]",
    },
    {
        title: "Rejected Disbursements",
        value: "₦550,000",
        change: "-2.0%",
        trend: "down",
        icon: XCircle,
        bgColor: "bg-[#F04438]/10",
        iconColor: "text-[#F04438]",
    },
];

export function DisbursementStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div key={stat.title} className="bg-white p-6 rounded-2xl border border-[#EAECF0] shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-full", stat.bgColor)}>
                            <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
                        </div>
                        <span className="text-sm font-medium text-[#667085]">{stat.title}</span>
                    </div>
                    
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-[#101828]">{stat.value}</span>
                        <div className="text-right">
                            <span className={cn(
                                "text-xs font-semibold flex items-center gap-1",
                                stat.trend === "up" ? "text-[#12B76A]" : "text-[#F04438]"
                            )}>
                                {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {stat.change}
                            </span>
                            <span className="text-[10px] text-[#667085]">from last month</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
