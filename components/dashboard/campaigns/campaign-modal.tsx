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
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CurrencySelect } from "@/components/form/currency-select";
import { CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignService, Campaign } from "@/services/campaigns";
import { categoryService } from "@/services/categories";
import { toast } from "sonner";
import dayjs from "dayjs";

const campaignSchema = z.object({
    title: z.string().min(1, "Title is required"),
    category: z.string().min(1, "Category is required"),
    goalAmount: z.string().min(1, "Goal amount is required"),
    currency: z.string().min(1, "Currency is required"),
    days: z.string().min(1, "days is required"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(8000, "Max 8000 words"),
    thumbnail: z.any().optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Campaign | null; // Campaign data for edit mode
}

export function CampaignModal({
    isOpen,
    onOpenChange,
    initialData,
}: CampaignModalProps) {
    const isEdit = !!initialData;

    const queryClient = useQueryClient();

    const { data: categoriesRes } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.getCategories(),
    });

    const category = React.useMemo(() => {
        if (!categoriesRes?.data) return [];
        return categoriesRes.data.map((cat) => ({
            value: cat.slug,
            label: cat.name,
        }));
    }, [categoriesRes]);

    const methods = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            title: "",
            category: "",
            goalAmount: "",
            currency: "NGN",
            days: "",
            description: "",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = methods;

    const createMutation = useMutation({
        mutationFn: (data: CampaignFormValues) => {
            return campaignService.createCampaign({
                title: data.title,
                body: data.description,
                currency: data.currency,
                goal_amount: data.goalAmount,
                type: data.category,
                days: data.days,
                images:
                    data.thumbnail instanceof File
                        ? [data.thumbnail]
                        : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            onOpenChange(false);
            toast.success("Campaign created successfully");
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create campaign");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CampaignFormValues) => {
            if (!initialData?.id) throw new Error("No campaign ID found");
            return campaignService.updateCampaign(initialData.id, {
                title: data.title,
                body: data.description,
                goal_amount: data.goalAmount,
                currency: data.currency,
                days: data.days,
                status: initialData.status,
                type: data.category,
                images:
                    data.thumbnail instanceof File
                        ? [data.thumbnail]
                        : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            onOpenChange(false);
            toast.success("Campaign updated successfully");
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update campaign");
        },
    });

    // Update form when initialData changes
    React.useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title,
                category: initialData.type || "",
                goalAmount: initialData.goal_amount.toString(),
                currency: initialData.currency || "NGN",
                days: dayjs(initialData.end_date).diff(dayjs(initialData.created_at), 'day').toString(),
                description: initialData.body,
            });
        } else {
            reset({
                title: "",
                category: "",
                goalAmount: "",
                currency: "NGN",
                days: "",
                description: "",
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: CampaignFormValues) => {
        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const categoryValue = watch("category");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Campaign" : "Create Campaign"}
                    </DialogTitle>
                </DialogHeader>
                <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 space-y-6"
                >
                    {/* Title */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-sm font-medium text-[#344054]"
                        >
                            Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="The strength of a people. The power of community."
                            {...register("title")}
                            className={cn(
                                "h-11 bg-white border-[#EAECF0]",
                                errors.title &&
                                    "border-red-500 focus-visible:ring-red-500",
                            )}
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="category"
                            className="text-sm font-medium text-[#344054]"
                        >
                            Category
                        </Label>
                        <Select
                            onValueChange={(value) =>
                                setValue("category", value)
                            }
                            value={categoryValue}
                        >
                            <SelectTrigger className="h-11 bg-white capitalize border-[#EAECF0]">
                                <SelectValue
                                    className="capitalize"
                                    placeholder="Select Category"
                                />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {category.map((cat) => (
                                    <SelectItem
                                        key={cat.value}
                                        value={cat.value}
                                        className="capitalize"
                                    >
                                        {cat.label.toLowerCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && (
                            <p className="text-xs text-red-500">
                                {errors.category.message}
                            </p>
                        )}
                    </div>

                    {/* Goal & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <CurrencySelect
                                name="currency"
                                label="Currency"
                                placeholder="Select currency"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="goalAmount"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Goal
                            </Label>
                            <Input
                                id="goalAmount"
                                placeholder="500,000"
                                {...register("goalAmount")}
                                className="h-11 bg-white border-[#EAECF0]"
                            />
                            {errors.goalAmount && (
                                <p className="text-xs text-red-500">
                                    {errors.goalAmount.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="duration"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Duration
                            </Label>
                            <Input
                                id="days"
                                placeholder="50 days"
                                {...register("days")}
                                className="h-11 bg-white border-[#EAECF0]"
                            />
                            {errors.days && (
                                <p className="text-xs text-red-500">
                                    {errors.days.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-sm font-medium text-[#344054]"
                        >
                            Description
                        </Label>
                        <div className="relative">
                            <Textarea
                                id="description"
                                placeholder="Describe your campaign..."
                                {...register("description")}
                                className="min-h-[160px] bg-white border-[#EAECF0] resize-none"
                            />
                            <div className="absolute bottom-3 left-3 text-[10px] text-[#667085]">
                                {(watch("description") || "").length} words
                            </div>
                        </div>
                        {errors.description && (
                            <p className="text-xs text-red-500">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#344054]">
                            Thumbnail
                        </Label>
                        <div
                            className={cn(
                                "border-2 border-dashed border-[#D0D5DD] rounded-xl p-8 flex flex-col items-center justify-center bg-[#F9FAFB] cursor-pointer hover:bg-[#F2F4F7] transition-colors relative group",
                                watch("thumbnail") &&
                                    "border-solid border-primary bg-white",
                            )}
                            onClick={() =>
                                document
                                    .getElementById("thumbnail-upload")
                                    ?.click()
                            }
                        >
                            <input
                                type="file"
                                id="thumbnail-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setValue("thumbnail", file);
                                }}
                            />
                            {watch("thumbnail") ? (
                                <div className="flex flex-col items-center gap-2">
                                    <img
                                        src={
                                            watch("thumbnail") instanceof File
                                                ? URL.createObjectURL(
                                                      watch("thumbnail"),
                                                  )
                                                : typeof watch("thumbnail") ===
                                                    "string"
                                                  ? watch("thumbnail")
                                                  : ""
                                        }
                                        alt="Chosen Thumbnail"
                                        className="h-20 w-auto rounded-lg object-cover"
                                    />
                                    <p className="text-sm text-[#475467] font-medium">
                                        {watch("thumbnail") instanceof File
                                            ? watch("thumbnail").name
                                            : "Current Image"}
                                    </p>
                                    <button
                                        type="button"
                                        className="text-xs text-red-500 hover:underline mt-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setValue("thumbnail", undefined);
                                        }}
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="h-10 w-10 rounded-lg bg-white border border-[#EAECF0] flex items-center justify-center mb-3">
                                        <CloudUpload className="h-5 w-5 text-[#667085]" />
                                    </div>
                                    <p className="text-sm text-[#475467]">
                                        <span className="font-semibold text-[#0E3B5D]">
                                            Drag & Drop your files
                                        </span>{" "}
                                        or{" "}
                                        <span className="font-semibold text-[#0E3B5D] underline">
                                            Browse
                                        </span>
                                    </p>
                                    <p className="text-xs text-[#667085] mt-1">
                                        Max. File Size: 10MB
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto min-w-[100px] h-11 border-[#EAECF0] text-[#344054] font-semibold"
                        >
                            Cancel
                        </Button>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 sm:flex-none min-w-[120px] h-11 border-[#EAECF0] text-[#344054] font-semibold"
                            >
                                Save as Draft
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none min-w-[120px] h-11 bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold"
                            >
                                {isEdit ? "Update Campaign" : "Publish"}
                            </Button>
                        </div>
                    </div>
                </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
