"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { MoreHorizontal, Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState } from "react";
import { PlanModal } from "@/components/dashboard/plans/plan-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planService, Plan } from "@/services/plans";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function PlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const queryClient = useQueryClient();

    const { data: plansRes, isLoading } = useQuery({
        queryKey: ["plans"],
        queryFn: () => planService.listPlans(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => planService.deletePlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            toast.success("Plan deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete plan");
        },
    });

    const plans = plansRes?.data || [];

    const handleEdit = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this plan?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns: ColumnDef<Plan>[] = [
        {
            accessorKey: "name",
            header: "Plan Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#101828]">{row.original.name}</span>
                    <span className="text-xs text-[#667085] line-clamp-1">{row.original.description}</span>
                </div>
            ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => (
                <span className="font-medium text-[#101828]">
                    {row.original.currency} {Number(row.original.price).toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: "duration",
            header: "Duration",
            cell: ({ row }) => (
                <span className="text-[#667085]">{row.original.duration} Days</span>
            ),
        },
        {
            accessorKey: "features",
            header: "Features",
            cell: ({ row }) => (
                <Badge variant="outline" className="font-normal text-[#667085] bg-[#F9FAFB]">
                    {row.original.features?.length || 0} Features
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex",
                        status ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                    )}>
                        {status ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {status ? "Active" : "Inactive"}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const plan = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#667085]"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white">
                            <DropdownMenuItem 
                                className="gap-2 text-sm text-[#344054] cursor-pointer"
                                onClick={() => handleEdit(plan)}
                            >
                                <Edit2 className="h-4 w-4" /> Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="gap-2 text-sm text-red-600 cursor-pointer"
                                onClick={() => handleDelete(plan.id)}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">
                            Subscription Plans
                        </h2>
                        <p className="text-sm text-[#475467]">
                            Configure pricing, features, and active status for platform plans.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2 transition-all shadow-sm"
                            onClick={handleCreate}
                        >
                            <Plus className="h-4 w-4" /> New Plan
                        </Button>
                    </div>
                </div>

                <PlanModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    initialData={selectedPlan}
                />

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-[#EAECF0] overflow-hidden shadow-sm">
                    <DataTable
                        columns={columns}
                        data={plans}
                        searchKey="name"
                        title="Plans Table"
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
