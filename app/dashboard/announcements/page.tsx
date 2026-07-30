"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Plus } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { AnnouncementModal } from "@/components/dashboard/announcements/announcement-modal";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { announcementService, Announcement } from "@/services/announcements";
import dayjs from "dayjs";

export default function AnnouncementsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: announcementsRes, isLoading } = useQuery({
        queryKey: ["announcements"],
        queryFn: () => announcementService.getAnnouncements(),
    });

    const announcements = announcementsRes?.data?.data || [];

    const handleCreate = () => {
        setIsModalOpen(true);
    };

    const columns: ColumnDef<Announcement>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <span className="font-medium text-[#101828]">{row.getValue("title")}</span>,
        },
        {
            accessorKey: "content",
            header: "Message",
            cell: ({ row }) => (
                <div className="max-w-[400px] truncate text-[#667085]">
                    {row.getValue("content")}
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Sent At",
            cell: ({ row }) => (
                <span className="text-[#667085]">
                    {dayjs(row.getValue("created_at")).format("MMM D, YYYY h:mm A")}
                </span>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <div className="w-full h-full flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#101828]">
                            Announcements
                        </h2>
                        <p className="text-sm text-[#667085] mt-1">
                            Send global push notifications to all users.
                        </p>
                    </div>
                    <Button onClick={handleCreate} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" />
                        Send Announcement
                    </Button>
                </div>

                <div className="bg-white rounded-xl border border-[#EAECF0] overflow-hidden flex-1">
                    <DataTable
                        columns={columns}
                        data={announcements}
                        isLoading={isLoading}
                        searchKey="title"
                    />
                </div>
            </div>

            <AnnouncementModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </DashboardLayout>
    );
}
