"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { MoreHorizontal, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState } from "react";
import { NeedModal } from "@/components/dashboard/needs/need-modal";
import { DisbursementModal } from "@/components/dashboard/disbursements/disbursement-modal";
import { DisbursementHistoryModal } from "@/components/dashboard/disbursements/disbursement-history-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { STATUS_FILTER, useServerTable } from "@/lib/use-server-table";
import { needService, Need } from "@/services/needs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

export default function NeedsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
    const [activeDisbursementNeed, setActiveDisbursementNeed] = useState<Need | null>(null);
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const isFundraiser = user?.role.slug === "fundraiser";

    const tableState = useServerTable({
        sortBy: "name",
        extra: isFundraiser && user?.id ? { added_by: user.id } : {},
    });

    const { data: needsRes, isLoading } = useQuery({
        queryKey: ["needs", tableState.params, isFundraiser ? user?.id : "all"],
        queryFn: () => needService.getNeeds(tableState.params),
        placeholderData: keepPreviousData,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => needService.deleteNeed(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["needs"] });
            toast.success("Need deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete need");
        },
    });

    const needs = needsRes?.data || [];

    const handleEdit = (need: Need) => {
        setSelectedNeed(need);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedNeed(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this need?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleDisburse = (need: Need) => {
        setActiveDisbursementNeed(need);
        setIsDisburseModalOpen(true);
    };

    const handleHistory = (need: Need) => {
        setActiveDisbursementNeed(need);
        setIsHistoryModalOpen(true);
    };

    const columns: ColumnDef<Need>[] = [
        {
            id: "name",
            accessorKey: "name",
            header: "Needs",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={row.original.image || ""} className="object-cover" />
                        <AvatarFallback className="rounded-lg bg-[#F9FAFB] text-[#667085]">
                            {row.original.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-[#101828]">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: "age",
            header: "Age",
            cell: ({ row }) => <span className="text-[#667085]">{row.getValue("age")} yrs</span>,
        },
        {
            accessorKey: "urgency",
            header: "Urgency",
            cell: ({ row }) => {
                const urgency = row.getValue("urgency") as string;
                return (
                    <Badge
                        variant={
                            urgency === "high"
                                ? "destructive"
                                : urgency === "medium"
                                  ? "warning"
                                  : "default"
                        }
                        className="capitalize"
                    >
                        {urgency}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "amount",
            header: "Goal Amount",
            cell: ({ row }) => {
                const currency = row.original.currency || "";
                const donated = Number(row.original.collected_amount || 0);
                const goal = Number(row.original.amount || 0);
                return (
                    <span className="font-semibold text-[#101828]">
                        {currency} {donated.toLocaleString()} / {goal.toLocaleString()}
                    </span>
                );
            },
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => <span className="text-[#667085]">{row.getValue("location")}</span>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center capitalize",
                        status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                    )}>
                        {status}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const need = row.original;
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
                        <DropdownMenuContent align="end" className="w-[190px] bg-white">
                            <DropdownMenuItem 
                                className="gap-2 text-sm text-emerald-600 cursor-pointer"
                                onClick={() => handleDisburse(need)}
                            >
                                <Plus className="h-4 w-4" /> Disburse Funds
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="gap-2 text-sm text-[#344054] cursor-pointer"
                                onClick={() => handleHistory(need)}
                            >
                                <Eye className="h-4 w-4 text-blue-500" /> Financial Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="gap-2 text-sm text-[#344054] cursor-pointer"
                                onClick={() => handleEdit(need)}
                            >
                                <Edit2 className="h-4 w-4" /> Edit Need
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="gap-2 text-sm text-red-600 cursor-pointer"
                                onClick={() => handleDelete(need.id)}
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
                            Needs Management
                        </h2>
                        <p className="text-sm text-[#475467]">
                            Manage and track humanitarian needs in the system.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
                            onClick={handleCreate}
                        >
                            <Plus className="h-4 w-4" /> New Need
                        </Button>
                    </div>
                </div>

                <NeedModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    initialData={selectedNeed}
                />

                <DisbursementModal
                    isOpen={isDisburseModalOpen}
                    onOpenChange={setIsDisburseModalOpen}
                    needId={activeDisbursementNeed?.id}
                />

                <DisbursementHistoryModal
                    isOpen={isHistoryModalOpen}
                    onOpenChange={setIsHistoryModalOpen}
                    needId={activeDisbursementNeed?.id}
                    title={activeDisbursementNeed?.name}
                />

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-[#EAECF0] overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={needs}
                        searchKey="name"
                        title="Needs Table"
                        isLoading={isLoading}
                        {...tableState.tableProps}
                        pageCount={(needsRes as any)?.meta?.last_page ?? 1}
                        total={(needsRes as any)?.meta?.total}
                        filterOptions={[STATUS_FILTER]}
                        sortField="name"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
