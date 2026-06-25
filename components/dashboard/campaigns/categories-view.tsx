"use client";

import * as React from "react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { MoreHorizontal, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, Category } from "@/services/categories";
import { CategoryModal } from "./category-modal";
import { toast } from "sonner";

export function CategoriesView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const queryClient = useQueryClient();

    const { data: categoriesRes, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete category");
        },
    });

    const categories = categoriesRes?.data || [];

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: "id",
            header: "No",
            cell: ({ row }) => (
                <span className="text-[#667085]">{row.index + 1}</span>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <span className="font-medium text-[#101828]">{row.getValue("name")}</span>
            ),
        },
        {
            accessorKey: "slug",
            header: "Slug",
            cell: ({ row }) => (
                <span className="text-[#667085]">{row.getValue("slug")}</span>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const desc = row.getValue("description") as string;
                return (
                    <span className="text-[#667085] truncate block max-w-[300px]">
                        {desc || "-"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const category = row.original;
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
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem
                                className="gap-2 text-sm text-[#344054]"
                                onClick={() => handleEdit(category)}
                            >
                                <Edit2 className="h-4 w-4" /> Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-2 text-sm text-red-600"
                                onClick={() => handleDelete(category.id)}
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <div className="space-y-8 mt-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">
                        Categories
                    </h2>
                    <p className="text-xs sm:text-sm text-[#475467]">
                        Manage donation categories.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2 h-11 sm:h-10 flex items-center justify-center"
                        onClick={handleCreate}
                    >
                        <Plus className="h-4 w-4" /> Create Category
                    </Button>
                </div>
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialData={selectedCategory}
            />

            {/* Table Section */}
            <DataTable
                columns={columns}
                data={categories}
                searchKey="name"
                title="Category Table"
                isLoading={isLoading}
            />
        </div>
    );
}
