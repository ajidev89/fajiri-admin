"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define the shape of our data
type Fundraiser = {
    id: string;
    no: number;
    name: string;
    email: string;
    verified: "Active" | "Pending";
    totalCampaigns: number;
    totalRaised: string;
    status: "Active" | "Suspended";
};

// Mock data
const fundraisers: Fundraiser[] = [
    {
        id: "1",
        no: 1,
        name: "Fajiri Family Foundation",
        email: "belljerome34@gmail.com",
        verified: "Active",
        totalCampaigns: 10,
        totalRaised: "4M",
        status: "Active",
    },
    {
        id: "2",
        no: 2,
        name: "Fajiri Family Foundation",
        email: "belljerome34@gmail.com",
        verified: "Pending",
        totalCampaigns: 10,
        totalRaised: "4M",
        status: "Active",
    },
    {
        id: "3",
        no: 3,
        name: "Fajiri Family Foundation",
        email: "belljerome34@gmail.com",
        verified: "Active",
        totalCampaigns: 10,
        totalRaised: "4M",
        status: "Active",
    },
    {
        id: "4",
        no: 4,
        name: "Fajiri Family Foundation",
        email: "belljerome34@gmail.com",
        verified: "Pending",
        totalCampaigns: 10,
        totalRaised: "4M",
        status: "Active",
    },
    {
        id: "5",
        no: 5,
        name: "Fajiri Family Foundation",
        email: "belljerome34@gmail.com",
        verified: "Active",
        totalCampaigns: 10,
        totalRaised: "4M",
        status: "Active",
    },
    {
        id: "6",
        no: 6,
        name: "Fajiri Family Foundation",
        email: "belljerome34@gmail.com",
        verified: "Pending",
        totalCampaigns: 10,
        totalRaised: "4M",
        status: "Active",
    },
];

// Columns definition
const columns: ColumnDef<Fundraiser>[] = [
    {
        accessorKey: "no",
        header: "No",
        cell: ({ row }) => <span className="text-[#667085]">{row.getValue("no")}</span>,
    },
    {
        accessorKey: "name",
        header: "Fundraiser Name",
        cell: ({ row }) => <span className="font-medium text-[#101828]">{row.getValue("name")}</span>,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-[#475467]">{row.getValue("email")}</span>,
    },
    {
        accessorKey: "verified",
        header: "Verified",
        cell: ({ row }) => {
            const verified = row.getValue("verified") as string;
            return (
                <Badge variant={verified === "Active" ? "success" : "warning"}>
                    {verified}
                </Badge>
            );
        },
    },
    {
        accessorKey: "totalCampaigns",
        header: "Total Campaigns",
        cell: ({ row }) => <span className="text-[#475467]">{row.getValue("totalCampaigns")}</span>,
    },
    {
        accessorKey: "totalRaised",
        header: "Total Raised",
        cell: ({ row }) => <span className="text-[#475467]">{row.getValue("totalRaised")}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === "Active" ? "success" : "suspended"}>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#667085]">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Verify Fundraiser</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Suspend Fundraiser</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function FundraiserPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">Fundraiser</h2>
                        <p className="text-sm text-[#475467]">Monitor and manage all fundraiser accounts.</p>
                    </div>
                    <div>
                        <Button variant="outline" className="border-[#EAECF0] text-[#344054] font-semibold flex items-center gap-2">
                            <FileDown className="h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* Table Section */}
                <DataTable 
                    columns={columns} 
                    data={fundraisers} 
                    searchKey="name" 
                    title="Fundraiser Table" 
                />
            </div>
        </DashboardLayout>
    );
}
