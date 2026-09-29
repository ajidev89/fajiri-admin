"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { FaqModal } from "@/components/dashboard/faqs/faq-modal";
import { Button } from "@/components/ui/button";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FAQ_TYPES, Faq, faqService } from "@/services/faqs";
import { useServerTable } from "@/lib/use-server-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function FaqsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
    const queryClient = useQueryClient();
    const tableState = useServerTable({ sortBy: "sort_order" });

    const { data: faqsRes, isLoading } = useQuery({
        queryKey: ["faqs", tableState.params],
        queryFn: () => faqService.getFaqs(tableState.params),
        placeholderData: keepPreviousData,
    });

    const faqs = faqsRes?.data ?? [];
    const meta = faqsRes?.meta;

    const deleteMutation = useMutation({
        mutationFn: (id: string) => faqService.deleteFaq(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faqs"] });
            toast.success("FAQ deleted");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete FAQ");
        },
    });

    const openCreate = () => {
        setSelectedFaq(null);
        setIsModalOpen(true);
    };

    const openEdit = (faq: Faq) => {
        setSelectedFaq(faq);
        setIsModalOpen(true);
    };

    const columns: ColumnDef<Faq>[] = [
        {
            accessorKey: "question",
            header: "Question",
            cell: ({ row }) => (
                <div className="max-w-[360px]">
                    <p className="font-medium text-[#101828]">{row.original.question}</p>
                    <p className="truncate text-sm text-[#667085]">{row.original.answer}</p>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <span className="text-[#344054]">{row.original.type_label}</span>
            ),
        },
        {
            accessorKey: "sort_order",
            header: "Order",
            cell: ({ row }) => (
                <span className="text-[#667085]">{row.original.sort_order}</span>
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                                if (window.confirm("Delete this FAQ?")) {
                                    deleteMutation.mutate(row.original.id);
                                }
                            }}
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
            <div className="w-full h-full flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#101828]">
                            FAQs
                        </h2>
                        <p className="text-sm text-[#667085] mt-1">
                            Add questions for General, Donations, and Members.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" />
                        Add FAQ
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={faqs}
                    isLoading={isLoading}
                    searchKey="question"
                    searchPlaceholder="Search FAQs"
                    filterOptions={[
                        {
                            key: "type",
                            label: "Type",
                            options: [
                                { value: "all", label: "All types" },
                                ...FAQ_TYPES.map((type) => ({
                                    value: type.value,
                                    label: type.label,
                                })),
                            ],
                        },
                    ]}
                    {...tableState.tableProps}
                    pageCount={meta?.last_page ?? 1}
                    total={meta?.total}
                    sortField="question"
                />
            </div>

            <FaqModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                faq={selectedFaq}
            />
        </DashboardLayout>
    );
}
