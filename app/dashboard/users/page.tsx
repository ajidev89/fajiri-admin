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
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define the shape of our data
type User = {
    id: string;
    no: number;
    name: string;
    email: string;
    role: "Donor" | "Member" | "Beneficiary";
    dateJoined: string;
    lastActive: string;
    status: "Active" | "Suspended";
};

// Mock data
const users: User[] = [
    {
        id: "1",
        no: 1,
        name: "Jerome Bell",
        email: "belljerome34@gmail.com",
        role: "Donor",
        dateJoined: "10-02-2026",
        lastActive: "Yesterday",
        status: "Active",
    },
    {
        id: "2",
        no: 2,
        name: "Floyd Miles",
        email: "floydmiles210@gmail.com",
        role: "Member",
        dateJoined: "10-02-2026",
        lastActive: "Today",
        status: "Active",
    },
    {
        id: "3",
        no: 3,
        name: "Jerome Bell",
        email: "belljerome34@gmail.com",
        role: "Beneficiary",
        dateJoined: "10-02-2026",
        lastActive: "Last week",
        status: "Suspended",
    },
    {
        id: "4",
        no: 4,
        name: "Floyd Miles",
        email: "floydmiles210@gmail.com",
        role: "Member",
        dateJoined: "10-02-2026",
        lastActive: "Today",
        status: "Active",
    },
    {
        id: "5",
        no: 5,
        name: "Jerome Bell",
        email: "belljerome34@gmail.com",
        role: "Donor",
        dateJoined: "10-02-2026",
        lastActive: "Yesterday",
        status: "Suspended",
    },
    {
        id: "6",
        no: 6,
        name: "Jerome Bell",
        email: "belljerome34@gmail.com",
        role: "Donor",
        dateJoined: "10-02-2026",
        lastActive: "Yesterday",
        status: "Suspended",
    },
    {
        id: "7",
        no: 7,
        name: "Floyd Miles",
        email: "floydmiles210@gmail.com",
        role: "Member",
        dateJoined: "10-02-2026",
        lastActive: "Today",
        status: "Active",
    },
    {
        id: "8",
        no: 8,
        name: "Jerome Bell",
        email: "belljerome34@gmail.com",
        role: "Donor",
        dateJoined: "10-02-2026",
        lastActive: "Yesterday",
        status: "Active",
    },
];

// Columns definition
const columns: ColumnDef<User>[] = [
    {
        accessorKey: "no",
        header: "No",
        cell: ({ row }) => <span className="text-[#667085]">{row.getValue("no")}</span>,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium text-[#101828]">{row.getValue("name")}</span>,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-[#475467]">{row.getValue("email")}</span>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span className="text-[#475467]">{row.getValue("role")}</span>,
    },
    {
        accessorKey: "dateJoined",
        header: "Date Joined",
    },
    {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: ({ row }) => <span className="text-[#475467]">{row.getValue("lastActive")}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center",
                    status === "Active" && "bg-green-50 text-green-700 border border-green-200",
                    status === "Suspended" && "bg-red-50 text-red-700 border border-red-200",
                )}>
                    {status}
                </div>
            );
        },
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
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/users/${row.original.id}`}>
                            View Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function UsersPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">Users</h2>
                        <p className="text-sm text-[#475467]">Manage platform members, donors, and beneficiaries.</p>
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
                    data={users} 
                    searchKey="name" 
                    title="Users Table" 
                />
            </div>
        </DashboardLayout>
    );
}
