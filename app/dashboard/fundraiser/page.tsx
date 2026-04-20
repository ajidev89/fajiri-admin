"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown, Plus, Key, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fundraiserService } from "@/services/fundraisers";
import { usersService, type UserWithWallet } from "@/services/users";
import { FundraiserModal } from "@/components/dashboard/fundraisers/fundraiser-modal";
import { toast } from "sonner";
import { format } from "date-fns";

export default function FundraiserPage() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const queryClient = useQueryClient();

    const { data: fundraisersRes, isLoading } = useQuery({
        queryKey: ["fundraisers"],
        queryFn: () => fundraiserService.listFundraisers(),
    });

    const fundraisers = fundraisersRes?.data || [];

    const resetPasswordMutation = useMutation({
        mutationFn: (userId: string) => fundraiserService.resetPassword(userId),
        onSuccess: () => {
            toast.success("Password reset link sent to fundraiser");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send reset link");
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ userId, status }: { userId: string; status: string }) => {
            return status === "active" 
                ? usersService.blockUser(userId) 
                : usersService.unblockUser(userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fundraisers"] });
            toast.success("Fundraiser status updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        },
    });

    const columns: ColumnDef<UserWithWallet>[] = [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => <span className="text-[#667085]">{row.index + 1}</span>,
        },
        {
            id: "name",
            header: "Fundraiser Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-[#101828]">
                        {row.original.profile?.first_name} {row.original.profile?.last_name}
                    </span>
                    <span className="text-xs text-[#667085]">@{row.original.username}</span>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <span className="text-[#475467]">{row.getValue("email")}</span>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge variant={status === "active" ? "success" : "suspended"}>
                        {status || "N/A"}
                    </Badge>
                );
            },
        },
        {
            id: "campaigns",
            header: "Campaigns",
            cell: ({ row }) => (
                <span className="text-[#475467]">
                    {(row.original as any).campaigns_count || row.original.campaigns?.length || 0}
                </span>
            ),
        },
        {
            id: "wallet",
            header: "Wallet Balance",
            cell: ({ row }) => (
                <span className="text-[#475467] font-medium">
                    {row.original.wallet?.currency || "NGN"}{" "}
                    {Number(row.original.wallet?.balance || 0).toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Joined Date",
            cell: ({ row }) => (
                <span className="text-[#667085]">
                    {format(new Date(row.original.created_at), "MMM d, yyyy")}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#667085]">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => resetPasswordMutation.mutate(row.original.id)}
                            disabled={resetPasswordMutation.isPending}
                        >
                            <Key className="h-4 w-4" /> 
                            {resetPasswordMutation.isPending ? "Sending..." : "Reset Password"}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => toggleStatusMutation.mutate({ 
                                userId: row.original.id, 
                                status: row.original.status 
                            })}
                            disabled={toggleStatusMutation.isPending}
                        >
                            {row.original.status === "active" ? (
                                <>
                                    <ShieldAlert className="h-4 w-4 text-red-600" />
                                    <span className="text-red-600">Suspend Fundraiser</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600">Unsuspend Fundraiser</span>
                                </>
                            )}
                        </DropdownMenuItem>

                        <DropdownMenuItem className="text-[#667085]">View Recent Campaigns</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <FundraiserModal 
                isOpen={isModalOpen} 
                onOpenChange={setIsModalOpen} 
            />
            
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-0">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">Fundraiser Accounts</h2>
                        <p className="text-xs sm:text-sm text-[#475467]">Monitor and manage all fundraiser accounts and their activities.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button variant="outline" className="border-[#EAECF0] text-[#344054] font-semibold flex items-center justify-center gap-2 h-11 sm:h-10">
                            <FileDown className="h-4 w-4" /> Export CSV
                        </Button>
                        <Button 
                            className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2 transition-all shadow-sm h-11 sm:h-10 flex items-center justify-center"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> New Fundraiser
                        </Button>
                    </div>
                </div>

                {/* Table Section */}
                <DataTable 
                    columns={columns} 
                    data={fundraisers} 
                    searchKey="email" 
                    title="Fundraiser Directory" 
                    isLoading={isLoading}
                />
            </div>
        </DashboardLayout>
    );
}
