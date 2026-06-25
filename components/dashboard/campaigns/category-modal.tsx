"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, Category } from "@/services/categories";
import { toast } from "sonner";

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().max(8000, "Max 8000 characters").optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Category | null;
}

export function CategoryModal({
    isOpen,
    onOpenChange,
    initialData,
}: CategoryModalProps) {
    const isEdit = !!initialData;
    const queryClient = useQueryClient();

    const methods = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = methods;

    const createMutation = useMutation({
        mutationFn: (data: CategoryFormValues) => {
            return categoryService.createCategory({
                name: data.name,
                slug: data.slug,
                description: data.description,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            onOpenChange(false);
            toast.success("Category created successfully");
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create category");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CategoryFormValues) => {
            if (!initialData?.id) throw new Error("No category ID found");
            return categoryService.updateCategory(initialData.id, {
                name: data.name,
                slug: data.slug,
                description: data.description,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            onOpenChange(false);
            toast.success("Category updated successfully");
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update category");
        },
    });

    // Auto-generate slug from name if not touched
    const name = watch("name");
    React.useEffect(() => {
        if (!isEdit && name) {
            setValue("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [name, isEdit, setValue]);

    // Update form when initialData changes
    React.useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                slug: initialData.slug,
                description: initialData.description || "",
            });
        } else {
            reset({
                name: "",
                slug: "",
                description: "",
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: CategoryFormValues) => {
        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Category" : "Create Category"}
                    </DialogTitle>
                </DialogHeader>
                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="p-6 space-y-6"
                    >
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium text-[#344054]"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Education"
                                    {...register("name")}
                                    className={cn(
                                        "h-11 bg-white border-[#EAECF0]",
                                        errors.name &&
                                            "border-red-500 focus-visible:ring-red-500",
                                    )}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="slug"
                                    className="text-sm font-medium text-[#344054]"
                                >
                                    Slug
                                </Label>
                                <Input
                                    id="slug"
                                    placeholder="education"
                                    {...register("slug")}
                                    className={cn(
                                        "h-11 bg-white border-[#EAECF0]",
                                        errors.slug &&
                                            "border-red-500 focus-visible:ring-red-500",
                                    )}
                                />
                                {errors.slug && (
                                    <p className="text-xs text-red-500">
                                        {errors.slug.message}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="description"
                                    className="text-sm font-medium text-[#344054]"
                                >
                                    Description (Optional)
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        id="description"
                                        placeholder="Category description..."
                                        {...register("description")}
                                        className="min-h-[120px] bg-white border-[#EAECF0] resize-none"
                                    />
                                </div>
                                {errors.description && (
                                    <p className="text-xs text-red-500">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EAECF0]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="w-full sm:w-auto min-w-[100px] h-11 border-[#EAECF0] text-[#344054] font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto min-w-[120px] h-11 bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold"
                            >
                                {isEdit ? "Update Category" : "Create Category"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
