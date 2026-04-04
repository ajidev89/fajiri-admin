"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { donationService } from "@/services";
import { formatDate } from "date-fns";
import { DonationWithCampaign, DonationWithNeed } from "@/services/donations";

// Mock data

// Columns definition
const columns: ColumnDef<DonationWithCampaign | DonationWithNeed>[] = [
    {
        accessorKey: "id",
        header: "No",
        cell: ({ row }) => (
            <span className="text-[#667085]">{row.index + 1}</span>
        ),
    },
    {
        accessorKey: "name",
        header: "Donor",
        cell: ({ row }) => (
            <span className="font-medium text-[#101828]">
                {row.getValue("name") ?? "Anonymous"}
            </span>
        ),
    },
    {
        accessorKey: "donatable",
        header: "Campaign Title",
        cell: ({ row }) => (
            <span className="text-[#101828] max-w-[200px] block truncate">
                {row.original?.donatable_type === "App\\Models\\Campaign"
                    ? row.original?.donatable?.title
                    : row.original?.donatable?.name}
            </span>
        ),
    },
    {
        accessorKey: "medium",
        header: "Medium",
        cell: ({ row }) => (
            <span className="font-medium capitalize text-[#101828]">
                {row.original?.medium}
            </span>
        ),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <span className="font-medium text-[#101828]">
                {row.original?.currency}
                {row.getValue("amount")}
            </span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => (
            <span className="text-[#475467]">
                {formatDate(row.getValue("created_at"), "dd/MM/yyyy HH:mm")}
            </span>
        ),
    },
    {
        accessorKey: "reference",
        header: "Transaction ID",
        cell: ({ row }) => (
            <span className="text-[#475467]">{row.getValue("reference")}</span>
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
                        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center",
                        status === "completed" &&
                            "bg-green-50 text-green-700 border border-green-200",
                        status === "pending" &&
                            "bg-orange-50 text-orange-700 border border-orange-200",
                        status === "failed" &&
                            "bg-red-50 text-red-700 border border-red-200",
                    )}
                >
                    {status}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: () => (
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
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                        Flag Transaction
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function DonationsPage() {
    const {
        data: donationsRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["donations"],
        queryFn: () => donationService.getDonations(),
    });

    const donations = React.useMemo(
        () => donationsRes?.data || [],
        [donationsRes],
    );

    console.log(donations);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">
                            Donations
                        </h2>
                        <p className="text-sm text-[#475467]">
                            Monitor and manage all contributions.
                        </p>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            className="border-[#EAECF0] text-[#344054] font-semibold flex items-center gap-2"
                        >
                            <FileDown className="h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* Table Section */}
                <DataTable
                    columns={columns}
                    data={donations}
                    searchKey="name"
                    isLoading={isLoading}
                    title="Donation Table"
                />
            </div>
        </DashboardLayout>
    );
}
