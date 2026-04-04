"use client";

import * as React from "react";
import Link from "next/link";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserWithWallet, usersService } from "@/services/users";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Columns definition
const columns: ColumnDef<UserWithWallet>[] = [
    {
        id: "no",
        header: "No",
        cell: ({ row }) => (
            <span className="text-[#667085]">{row.index + 1}</span>
        ),
    },
    {
        id: "name",
        header: "Name",
        accessorFn: (row) =>
            `${row.profile?.first_name || ""} ${row.profile?.last_name || ""}`.trim(),
        cell: ({ row }) => (
            <span className="font-medium text-[#101828]">
                {row.getValue("name")}
            </span>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <span className="text-[#475467]">{row.getValue("email")}</span>
        ),
    },
    {
        id: "role",
        header: "Role",
        accessorFn: (row) => row.role?.name,
        cell: ({ row }) => (
            <span className="text-[#475467]">{row.getValue("role")}</span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Date Joined",
        cell: ({ row }) => {
            const date = row.getValue("created_at") as string;
            return (
                <span className="text-[#475467]">
                    {date ? format(new Date(date), "dd-MM-yyyy") : "-"}
                </span>
            );
        },
    },
    {
        accessorKey: "last_login_at",
        header: "Last Active",
        cell: ({ row }) => {
            const date = row.getValue("last_login_at") as string;
            return (
                <span className="text-[#475467]">
                    {date ? format(new Date(date), "dd-MM-yyyy") : "-"}
                </span>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div
                    className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center capitalize",
                        status === "active" &&
                            "bg-green-50 text-green-700 border border-green-200",
                        status === "suspended" &&
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
        cell: ({ row }) => <UserActionCell user={row.original} />,
    },
];

function UserActionCell({ user }: { user: UserWithWallet }) {
    const [isSuspendModalOpen, setIsSuspendModalOpen] = React.useState(false);
    const queryClient = useQueryClient();

    const isSuspended = user.deleted_at !== null;

    const blockMutation = useMutation({
        mutationFn: () => usersService.blockUser(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsSuspendModalOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to block user");
            setIsSuspendModalOpen(false);
        },
    });

    const unblockMutation = useMutation({
        mutationFn: () => usersService.unblockUser(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsSuspendModalOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to unblock user");
            setIsSuspendModalOpen(false);
        },
    });

    const handleConfirm = () => {
        if (isSuspended) {
            unblockMutation.mutate();
        } else {
            blockMutation.mutate();
        }
    };

    const isSubmitting = blockMutation.isPending || unblockMutation.isPending;

    return (
        <>
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
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/users/${user.id}`}>
                            View Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                    <DropdownMenuItem
                        className={
                            isSuspended ? "text-green-600" : "text-red-600"
                        }
                        onClick={() => setIsSuspendModalOpen(true)}
                    >
                        {isSuspended ? "Unsuspend User" : "Suspend User"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={isSuspendModalOpen}
                onOpenChange={setIsSuspendModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isSuspended ? "Unsuspend User" : "Suspend User"}
                        </DialogTitle>
                        <DialogDescription>
                            {isSuspended
                                ? `Are you sure you want to unsuspend ${user.profile?.first_name || "this user"}? They will regain access to the platform.`
                                : `Are you sure you want to suspend ${user.profile?.first_name || "this user"}? They will lose access to the platform until unsuspended.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsSuspendModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            className={
                                isSuspended
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                            }
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Processing..."
                                : isSuspended
                                  ? "Unsuspend"
                                  : "Suspend"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function UsersPage() {
    const { data: usersRes, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => usersService.getUsers(),
    });

    const users = React.useMemo(() => usersRes?.data ?? [], [usersRes]);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">
                            Users
                        </h2>
                        <p className="text-sm text-[#475467]">
                            Manage platform members, donors, and beneficiaries.
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
                    data={users}
                    searchKey="name"
                    title="Users Table"
                    isLoading={isLoading}
                />
            </div>
        </DashboardLayout>
    );
}
