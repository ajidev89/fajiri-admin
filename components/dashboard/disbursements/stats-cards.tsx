import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, MinusCircle, CheckCircle, XCircle } from "lucide-react";
import { DisbursementAnalyticsResponse } from "@/services/analytics";

interface DisbursementStatsProps {
    stats?: DisbursementAnalyticsResponse;
    isLoading?: boolean;
}

export function DisbursementStats({ stats, isLoading }: DisbursementStatsProps) {
    const formatCurrency = (amount: number, currency: string = "$") => {
        return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getAmountForUsd = (amounts: Record<string, number>) => {
        return amounts["USD"] || 0;
    };

    const data = [
        {
            title: "Available Funds",
            value: stats ? formatCurrency(stats.available_funds_usd) : "$0.00",
            icon: Wallet,
            bgColor: "bg-[#0E3B5D]/10",
            iconColor: "text-[#0E3B5D]",
        },
        {
            title: "Pending Disbursements",
            value: stats ? formatCurrency(getAmountForUsd(stats.pending_disbursements.amounts)) : "$0.00",
            icon: MinusCircle,
            bgColor: "bg-[#344054]/10",
            iconColor: "text-[#344054]",
        },
        {
            title: "Approved Disbursements",
            value: stats ? formatCurrency(getAmountForUsd(stats.approved_disbursements.amounts)) : "$0.00",
            icon: CheckCircle,
            bgColor: "bg-[#12B76A]/10",
            iconColor: "text-[#12B76A]",
        },
        {
            title: "Rejected Disbursements",
            value: stats ? formatCurrency(getAmountForUsd(stats.rejected_disbursements.amounts)) : "$0.00",
            icon: XCircle,
            bgColor: "bg-[#F04438]/10",
            iconColor: "text-[#F04438]",
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-[#EAECF0] shadow-sm animate-pulse h-[140px]" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((item) => (
                <div key={item.title} className="bg-white p-6 rounded-2xl border border-[#EAECF0] shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-full", item.bgColor)}>
                            <item.icon className={cn("h-6 w-6", item.iconColor)} />
                        </div>
                        <span className="text-sm font-medium text-[#667085]">{item.title}</span>
                    </div>
                    
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-[#101828]">{item.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
