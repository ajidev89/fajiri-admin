"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown, Flag, Eye, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { donationService } from "@/services";
import { formatDate } from "date-fns";
import {
    AnyDonation,
    Donation,
    getDonationTitle,
    getDonationType,
} from "@/services/donations";
import { DonationDetailsModal } from "@/components/dashboard/donations/donation-details-modal";
import { FlagDonationModal } from "@/components/dashboard/donations/flag-donation-modal";
import { downloadDonationReceipt } from "@/lib/donation-receipt";

interface DonationActions {
    onView: (donation: Donation) => void;
    onDownloadReceipt: (donation: Donation) => void;
    onFlag: (donation: Donation) => void;
    onUnflag: (donation: Donation) => void;
}

// Columns definition
const buildColumns = ({
    onView,
    onDownloadReceipt,
    onFlag,
    onUnflag,
}: DonationActions): ColumnDef<AnyDonation>[] => [
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
        id: "title",
        accessorFn: (row) => getDonationTitle(row),
        header: "Title",
        cell: ({ row }) => {
            const title = getDonationTitle(row.original);
            return (
                <span
                    className="text-[#101828] max-w-[200px] block truncate"
                    title={title}
                >
                    {title}
                </span>
            );
        },
    },
    {
        id: "type",
        accessorFn: (row) => getDonationType(row),
        header: "Type",
        cell: ({ row }) => {
            const type = getDonationType(row.original);
            return (
                <span
                    className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center border",
                        type === "campaign"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200",
                    )}
                >
                    {type === "campaign" ? "Campaign" : "Need"}
                </span>
            );
        },
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
                <div className="flex items-center">
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
                    {row.original?.is_flagged && (
                        <span
                            className="ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                            title={row.original?.flag_reason ?? "Flagged"}
                        >
                            <Flag className="h-3 w-3" /> Flagged
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const donation = row.original;
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(donation)}>
                            <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDownloadReceipt(donation)}
                        >
                            <FileDown className="h-4 w-4" /> Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {donation.is_flagged ? (
                            <DropdownMenuItem onClick={() => onUnflag(donation)}>
                                <Flag className="h-4 w-4" /> Remove Flag
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-700"
                                onClick={() => onFlag(donation)}
                            >
                                <Flag className="h-4 w-4 text-red-600" /> Flag
                                Transaction
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

type TypeFilter = "all" | "campaign" | "need";

export default function DonationsPage() {
    const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");

    const {
        data: donationsRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["donations", typeFilter],
        queryFn: () =>
            donationService.getDonations(
                typeFilter === "all" ? undefined : { type: typeFilter },
            ),
    });

    const donations = React.useMemo(
        () => (donationsRes?.data || []) as AnyDonation[],
        [donationsRes],
    );

    const queryClient = useQueryClient();
    const [viewing, setViewing] = React.useState<Donation | null>(null);
    const [flagging, setFlagging] = React.useState<Donation | null>(null);

    const unflagMutation = useMutation({
        mutationFn: (id: string) => donationService.unflagDonation(id),
        onSuccess: (_res, id) => {
            toast.success("Flag removed");
            queryClient.invalidateQueries({ queryKey: ["donations"] });
            queryClient.invalidateQueries({ queryKey: ["donation", id] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove flag");
        },
    });

    const handleDownloadReceipt = React.useCallback((donation: Donation) => {
        try {
            downloadDonationReceipt(donation);
        } catch (error) {
            toast.error((error as Error).message || "Could not generate receipt");
        }
    }, []);

    const columns = React.useMemo(
        () =>
            buildColumns({
                onView: setViewing,
                onDownloadReceipt: handleDownloadReceipt,
                onFlag: setFlagging,
                onUnflag: (d) => unflagMutation.mutate(d.id),
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handleDownloadReceipt],
    );


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
                    filters={
                        <Select
                            value={typeFilter}
                            onValueChange={(v) => setTypeFilter(v as TypeFilter)}
                        >
                            <SelectTrigger className="h-10 w-full sm:w-[150px] gap-2 border-[#EAECF0] text-[#344054] font-medium shadow-none [&>span]:flex-1 [&>span]:text-left">
                                <Filter className="h-4 w-4 text-[#667085]" />
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="campaign">Campaign</SelectItem>
                                <SelectItem value="need">Need</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />
            </div>

            <DonationDetailsModal
                isOpen={!!viewing}
                onOpenChange={(open) => !open && setViewing(null)}
                donation={viewing}
                onDownloadReceipt={handleDownloadReceipt}
                onFlag={(d) => setFlagging(d)}
                onUnflag={(d) => unflagMutation.mutate(d.id)}
                isUnflagging={unflagMutation.isPending}
            />

            <FlagDonationModal
                isOpen={!!flagging}
                onOpenChange={(open) => !open && setFlagging(null)}
                donation={flagging}
            />
        </DashboardLayout>
    );
}
