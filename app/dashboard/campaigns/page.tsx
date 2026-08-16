"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CampaignStats } from "@/components/dashboard/campaigns/stats-cards";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { MoreHorizontal, Plus, Edit2, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState } from "react";
import { CampaignModal } from "@/components/dashboard/campaigns/campaign-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { campaignService, Campaign } from "@/services/campaigns";
import { useAuthStore } from "@/store/auth-store";
import { CategoriesView } from "@/components/dashboard/campaigns/categories-view";

// Columns definition
const columns: ColumnDef<Campaign>[] = [
    {
        accessorKey: "id",
        header: "No",
        cell: ({ row }) => (
            <span className="text-[#667085]">{row.index + 1}</span>
        ),
    },
    {
        accessorKey: "title",
        header: "Campaign Title",
        cell: ({ row }) => (
            <span className="font-medium text-[#101828] max-w-[200px] block truncate">
                {row.getValue("title")}
            </span>
        ),
    },
    {
        accessorKey: "fundraiser", // This might need mapping from API if available
        header: "Fundraiser",
        cell: () => <span className="text-[#667085]">Fajiri Admin</span>,
    },
    {
        accessorKey: "type",
        header: "Category",
    },
    {
        accessorKey: "goal_amount",
        header: "Goal Amount",
        cell: ({ row }) => (
            <span>
                {row.original.currency}
                {Number(row.getValue("goal_amount")).toLocaleString()}
            </span>
        ),
    },
    {
        accessorKey: "collected_amount",
        header: "Raised Amount",
        cell: ({ row }) => (
            <span>
                {row.original.currency}
                {Number(row.getValue("collected_amount")).toLocaleString()}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div
                    className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center capitalize",
                        status === "active" && "bg-blue-50 text-blue-700",
                        status === "pending" && "bg-orange-50 text-orange-700",
                        status === "completed" && "bg-green-50 text-green-700",
                        status === "rejected" && "bg-red-50 text-red-700",
                    )}
                >
                    {status}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const campaign = row.original;
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
                    <DropdownMenuContent align="end" className="w-[190px] bg-white rounded-xl shadow-lg border border-slate-100 p-1">
                        <DropdownMenuItem
                            className="gap-2 text-xs font-bold text-emerald-600 cursor-pointer"
                            onClick={() => {
                                window.dispatchEvent(
                                    new CustomEvent("disburse-campaign", {
                                        detail: campaign,
                                    }),
                                );
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" /> Disburse Funds
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2 text-xs font-medium text-slate-700 cursor-pointer"
                            onClick={() => {
                                window.dispatchEvent(
                                    new CustomEvent("history-campaign", {
                                        detail: campaign,
                                    }),
                                );
                            }}
                        >
                            <Eye className="h-3.5 w-3.5 text-blue-500" /> Financial Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2 text-xs text-[#344054] cursor-pointer"
                            onClick={() => {
                                window.dispatchEvent(
                                    new CustomEvent("edit-campaign", {
                                        detail: campaign,
                                    }),
                                );
                            }}
                        >
                            <Edit2 className="h-3.5 w-3.5" /> Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            onClick={() => {
                                window.dispatchEvent(
                                    new CustomEvent("delete-campaign", {
                                        detail: campaign,
                                    }),
                                );
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" /> Delete Campaign
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

import { DisbursementModal } from "@/components/dashboard/disbursements/disbursement-modal";
import { DisbursementHistoryModal } from "@/components/dashboard/disbursements/disbursement-history-modal";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CampaignsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [activeDisbursementCampaign, setActiveDisbursementCampaign] = useState<Campaign | null>(null);

    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const isFundraiser = user?.role.slug === "fundraiser";

    const { data: campaignsRes, isLoading } = useQuery({
        queryKey: ["campaigns", isFundraiser ? user?.id : "all"],
        queryFn: () => campaignService.listCampaigns(isFundraiser ? { added_by: user?.id || "" } : {}),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => campaignService.deleteCampaign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            toast.success("Campaign deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete campaign");
        },
    });

    const campaigns = campaignsRes?.data || [];

    const handleEdit = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleDisburse = (campaign: Campaign) => {
        setActiveDisbursementCampaign(campaign);
        setIsDisburseModalOpen(true);
    };

    const handleHistory = (campaign: Campaign) => {
        setActiveDisbursementCampaign(campaign);
        setIsHistoryModalOpen(true);
    };

    const handleDelete = (campaign: Campaign) => {
        if (confirm(`Are you sure you want to delete "${campaign.title}"? This action cannot be undone.`)) {
            deleteMutation.mutate(campaign.id);
        }
    };

    const handleCreate = () => {
        setSelectedCampaign(null);
        setIsModalOpen(true);
    };

    // Listen for events from the table row
    React.useEffect(() => {
        const onEdit = (e: any) => handleEdit(e.detail);
        const onDisburse = (e: any) => handleDisburse(e.detail);
        const onHistory = (e: any) => handleHistory(e.detail);
        const onDelete = (e: any) => handleDelete(e.detail);

        window.addEventListener("edit-campaign", onEdit);
        window.addEventListener("disburse-campaign", onDisburse);
        window.addEventListener("history-campaign", onHistory);
        window.addEventListener("delete-campaign", onDelete);

        return () => {
            window.removeEventListener("edit-campaign", onEdit);
            window.removeEventListener("disburse-campaign", onDisburse);
            window.removeEventListener("history-campaign", onHistory);
            window.removeEventListener("delete-campaign", onDelete);
        };
    }, []);

    return (
        <DashboardLayout>
            <Tabs defaultValue="campaigns" className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <TabsList className="bg-[#F2F4F7] p-1 h-12">
                        <TabsTrigger 
                            value="campaigns" 
                            className="text-sm font-medium h-10 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                            Campaigns
                        </TabsTrigger>
                        <TabsTrigger 
                            value="categories" 
                            className="text-sm font-medium h-10 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                            Categories
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="campaigns" className="mt-0 outline-none">
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-0">
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">
                                    All Campaigns
                                </h2>
                                <p className="text-xs sm:text-sm text-[#475467]">
                                    Manage and monitor all donation campaigns in the system.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="border-[#EAECF0] text-[#344054] font-semibold h-11 sm:h-10 flex items-center justify-center"
                                >
                                    Export Data
                                </Button>
                                <Button
                                    className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2 h-11 sm:h-10 flex items-center justify-center"
                                    onClick={handleCreate}
                                >
                                    <Plus className="h-4 w-4" /> Create Campaign
                                </Button>
                            </div>
                        </div>

                        <CampaignModal
                            isOpen={isModalOpen}
                            onOpenChange={setIsModalOpen}
                            initialData={selectedCampaign}
                        />

                        {/* Modal-based Disburse Funds popup */}
                        <DisbursementModal
                            isOpen={isDisburseModalOpen}
                            onOpenChange={setIsDisburseModalOpen}
                            campaignId={activeDisbursementCampaign?.id}
                        />

                        {/* Modal-based Financial Activity History */}
                        <DisbursementHistoryModal
                            isOpen={isHistoryModalOpen}
                            onOpenChange={setIsHistoryModalOpen}
                            campaignId={activeDisbursementCampaign?.id || ""}
                            campaignTitle={activeDisbursementCampaign?.title}
                        />

                        {/* Stats Cards */}
                        <CampaignStats />

                        {/* Table Section */}
                        <DataTable
                            columns={columns}
                            data={campaigns}
                            searchKey="title"
                            title="Campaign Table"
                            isLoading={isLoading}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="categories" className="mt-0 outline-none">
                    <CategoriesView />
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
