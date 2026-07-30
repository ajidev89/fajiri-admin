"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plan } from "@/services/plans";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PlanPreviewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    plan: Plan | null;
}

export function PlanPreviewModal({ isOpen, onOpenChange, plan }: PlanPreviewModalProps) {
    if (!plan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        Plan Preview
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Header Section */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-[#101828]">{plan.name}</h3>
                            <p className="text-sm text-[#667085] mt-1">{plan.description || "No description provided."}</p>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                            plan.status ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                        )}>
                            {plan.status ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {plan.status ? "Active" : "Inactive"}
                        </div>
                    </div>

                    {/* Price and Duration */}
                    <div className="bg-[#F9FAFB] rounded-xl p-4 flex items-center justify-between border border-[#EAECF0]">
                        <div>
                            <p className="text-sm font-medium text-[#667085]">Price</p>
                            <p className="text-xl font-bold text-[#101828]">
                                {plan.currency} {Number(plan.price).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-[#667085]">Duration</p>
                            <p className="text-xl font-bold text-[#101828]">{plan.duration} Days</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-[#667085]">Level</p>
                            <p className="text-sm font-semibold text-[#101828]">{plan.level}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-[#667085]">Account Type</p>
                            <Badge variant="outline" className="font-normal bg-[#F0F5F9] text-primary">
                                {plan.account_type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-[#101828]">Features Included</h4>
                        <ul className="space-y-2">
                            {plan.features?.length > 0 ? (
                                plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                        <span className="text-sm text-[#475467] leading-tight">{feature}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-[#667085] italic">No features listed.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
