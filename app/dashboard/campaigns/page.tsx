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
    DropdownMenuTrigger 
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";

// Define the shape of our data
type Campaign = {
    id: string;
    no: number;
    title: string;
    fundraiser: string;
    category: string;
    goalAmount: string;
    raisedAmount: string;
    status: "Active" | "Pending" | "Completed" | "Rejected";
};

// Mock data
const campaigns: Campaign[] = [
    {
        id: "1",
        no: 1,
        title: "Strength is Unity: Cancer Patient Support Program",
        fundraiser: "Sustaining Future Project",
        category: "Medical",
        goalAmount: "₦500,000",
        raisedAmount: "₦275,000",
        status: "Pending",
    },
    {
        id: "2",
        no: 2,
        title: "Feed 1,000 Families This Ramadan",
        fundraiser: "Ramadan Zakat Appeal",
        category: "Food",
        goalAmount: "₦500,000",
        raisedAmount: "₦275,000",
        status: "Rejected",
    },
    {
        id: "3",
        no: 3,
        title: "Build a Community Health Center",
        fundraiser: "Community Walkathon",
        category: "Development",
        goalAmount: "₦500,000",
        raisedAmount: "₦275,000",
        status: "Completed",
    },
    {
        id: "4",
        no: 4,
        title: "Strength is Unity: Cancer Patient Support Program",
        fundraiser: "Sustaining Future Project",
        category: "Medical",
        goalAmount: "₦500,000",
        raisedAmount: "₦275,000",
        status: "Active",
    },
    {
        id: "5",
        no: 5,
        title: "Strength is Unity: Cancer Patient Support Program",
        fundraiser: "Sustaining Future Project",
        category: "Medical",
        goalAmount: "₦500,000",
        raisedAmount: "₦275,000",
        status: "Pending",
    },
    {
        id: "6",
        no: 6,
        title: "Strength is Unity: Cancer Patient Support Program",
        fundraiser: "Sustaining Future Project",
        category: "Medical",
        goalAmount: "₦500,000",
        raisedAmount: "₦275,000",
        status: "Rejected",
    },
];

// Columns definition
const columns: ColumnDef<Campaign>[] = [
    {
        accessorKey: "no",
        header: "No",
        cell: ({ row }) => <span className="text-[#667085]">{row.getValue("no")}</span>,
    },
    {
        accessorKey: "title",
        header: "Campaign Title",
        cell: ({ row }) => <span className="font-medium text-[#101828] max-w-[200px] block truncate">{row.getValue("title")}</span>,
    },
    {
        accessorKey: "fundraiser",
        header: "Fundraiser",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "goalAmount",
        header: "Goal Amount",
    },
    {
        accessorKey: "raisedAmount",
        header: "Raised Amount",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center",
                    status === "Active" && "bg-blue-50 text-blue-700",
                    status === "Pending" && "bg-orange-50 text-orange-700",
                    status === "Completed" && "bg-green-50 text-green-700",
                    status === "Rejected" && "bg-red-50 text-red-700",
                )}>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#667085]">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem className="gap-2 text-sm text-[#344054]">
                            <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="gap-2 text-sm text-[#344054]"
                            onClick={() => {
                                // This will be handled by the parent component's state
                                window.dispatchEvent(new CustomEvent('edit-campaign', { detail: campaign }));
                            }}
                        >
                            <Edit2 className="h-4 w-4" /> Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm text-red-600">
                            <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function CampaignsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    // Using an event listener approach for the column-level edit button
    // Alternatively, we could pass the edit function into the columns definition
    const handleEdit = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCampaign(null);
        setIsModalOpen(true);
    };

    // Listen for edit events from the table row
    React.useEffect(() => {
        const onEdit = (e: any) => handleEdit(e.detail);
        window.addEventListener('edit-campaign', onEdit);
        return () => window.removeEventListener('edit-campaign', onEdit);
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">All Campaigns</h2>
                        <p className="text-sm text-[#475467]">Manage and monitor all donation campaigns in the system.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-[#EAECF0] text-[#344054] font-semibold">
                            Export Data
                        </Button>
                        <Button 
                            className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2"
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

                {/* Stats Cards */}
                <CampaignStats />

                {/* Table Section */}
                <DataTable 
                    columns={columns} 
                    data={campaigns} 
                    searchKey="title" 
                    title="Campaign Table" 
                />
            </div>
        </DashboardLayout>
    );
}
