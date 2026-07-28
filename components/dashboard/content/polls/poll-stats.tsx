"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: number;
    changeLabel?: string;
    changePositive?: boolean;
}

function StatCard({ label, value, changeLabel, changePositive }: StatCardProps) {
    return (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 space-y-2">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {changeLabel && (
                <div
                    className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        changePositive ? "text-green-600" : "text-red-500"
                    )}
                >
                    {changePositive ? (
                        <TrendingUp size={12} />
                    ) : (
                        <TrendingDown size={12} />
                    )}
                    {changeLabel}
                </div>
            )}
        </div>
    );
}

interface PollStatsProps {
    totalVotes: number;
    totalViews: number;
}

export function PollStats({ totalVotes, totalViews }: PollStatsProps) {
    return (
        <div>
            <p className="text-base font-semibold text-gray-900 mb-3">Stats</p>
            <div className="flex gap-4">
                <StatCard
                    label="Total Votes"
                    value={totalVotes}
                    changeLabel="+2% from yesterday"
                    changePositive
                />
                <StatCard
                    label="Total questions view"
                    value={totalViews}
                    changeLabel="-2% from last month"
                    changePositive={false}
                />
            </div>
        </div>
    );
}
