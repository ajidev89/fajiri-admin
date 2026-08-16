"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pollService, type Poll } from "@/services/polls";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Participant Avatars ───────────────────────────────────────────────────────

function ParticipantStack({ count }: { count: number }) {
    const shown = Math.min(count, 4);
    return (
        <div className="flex items-center">
            {Array.from({ length: shown }).map((_, i) => (
                <Avatar
                    key={i}
                    className="w-7 h-7 border-2 border-white -ml-2 first:ml-0"
                >
                    <AvatarFallback className="bg-gray-300 text-[10px]">U</AvatarFallback>
                </Avatar>
            ))}
            {count > 4 && (
                <div className="w-7 h-7 rounded-full bg-[#1C274C] text-white flex items-center justify-center text-[10px] font-medium border-2 border-white -ml-2">
                    +{count - 4}
                </div>
            )}
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function PollStatusBadge({ status }: { status: Poll["status"] }) {
    const map: Record<Poll["status"], { label: string; className: string }> = {
        active: {
            label: "Active",
            className: "border border-green-500 text-green-600 bg-green-50",
        },
        inactive: {
            label: "Inactive",
            className: "border border-gray-300 text-gray-400 bg-white",
        },
        draft: {
            label: "Draft",
            className: "border border-yellow-400 text-yellow-600 bg-yellow-50",
        },
    };
    const cfg = map[status];
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg.className}`}
        >
            {cfg.label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PollsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-polls", search],
        queryFn: () => pollService.getPolls(search ? { search } : undefined),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => pollService.deletePoll(id),
        onSuccess: () => {
            toast.success("Poll deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-polls"] });
        },
        onError: (error: any) => toast.error(error?.message || "Failed to delete poll"),
    });

    const polls: Poll[] = data?.data ?? [];

    const columns: ColumnDef<Poll>[] = [
        {
            header: "No",
            cell: ({ row }) => (
                <span className="text-gray-500 text-sm">{row.index + 1}</span>
            ),
        },
        {
            accessorKey: "title",
            header: "Poll Name",
            cell: ({ row }) => (
                <Link
                    href={`/dashboard/content/polls/${row.original.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-[#1C274C] hover:underline"
                >
                    {row.original.title}
                </Link>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date Created",
            cell: ({ row }) => (
                <span className="text-sm text-gray-500">
                    {format(new Date(row.original.created_at), "MMM d, yyyy | hh:mmaaa")}
                </span>
            ),
        },
        {
            accessorKey: "time_left",
            header: "Time Left",
            cell: ({ row }) => (
                <span className="text-sm text-gray-700">{row.original.time_left}</span>
            ),
        },
        {
            accessorKey: "participants_count",
            header: "Participants",
            cell: ({ row }) => (
                <ParticipantStack count={row.original.participants_count} />
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <PollStatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            id={`poll-actions-${row.original.id}`}
                            className="p-1 rounded hover:bg-gray-100"
                        >
                            <MoreHorizontal size={16} className="text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(`/dashboard/content/polls/${row.original.id}`)
                            }
                        >
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(`/dashboard/content/polls/${row.original.id}/edit`)
                            }
                        >
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => deleteMutation.mutate(row.original.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Poll</h1>
                <Link href="/dashboard/content/polls/create">
                    <Button
                        id="new-poll-btn"
                        className="bg-[#1C274C] hover:bg-[#1C274C]/90 text-white"
                    >
                        <Plus size={16} className="mr-2" />
                        New Poll
                    </Button>
                </Link>
            </div>

            {/* Poll History Table */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Poll History</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <Input
                                id="poll-search"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-8 w-48 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <DataTable
                        columns={columns}
                        data={polls}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
