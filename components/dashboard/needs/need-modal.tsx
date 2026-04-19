"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { needService, Need } from "@/services/needs";
import { toast } from "sonner";

const needSchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.string().min(1, "Age is required"),
    location: z.string().min(1, "Location is required"),
    urgency: z.string().min(1, "Urgency is required"),
    currency: z.string().min(1, "Currency is required"),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().min(1, "Description is required").max(5000, "Max 5000 characters"),
    image: z.any().optional(),
});

type NeedFormValues = z.infer<typeof needSchema>;

interface NeedModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Need | null;
}

export function NeedModal({
    isOpen,
    onOpenChange,
    initialData,
}: NeedModalProps) {
    const isEdit = !!initialData;
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<NeedFormValues>({
        resolver: zodResolver(needSchema),
        defaultValues: {
            name: "",
            age: "",
            location: "",
            urgency: "medium",
            currency: "NGN",
            amount: "",
            description: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: NeedFormValues) => {
            return needService.createNeed({
                name: data.name,
                description: data.description,
                urgency: data.urgency,
                location: data.location,
                age: data.age,
                currency: data.currency,
                amount: data.amount,
                image: data.image instanceof File ? data.image : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["needs"] });
            onOpenChange(false);
            toast.success("Need created successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create need");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: NeedFormValues) => {
            if (!initialData?.id) throw new Error("No Need ID found");
            return needService.updateNeed(initialData.id, {
                name: data.name,
                description: data.description,
                urgency: data.urgency,
                location: data.location,
                age: data.age,
                currency: data.currency,
                amount: data.amount,
                image: data.image instanceof File ? data.image : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["needs"] });
            onOpenChange(false);
            toast.success("Need updated successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update need");
        },
    });

    React.useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                age: initialData.age.toString(),
                location: initialData.location,
                urgency: initialData.urgency,
                currency: initialData.currency || "NGN",
                amount: initialData.amount?.toString() || "",
                description: initialData.description,
            });
        } else {
            reset({
                name: "",
                age: "",
                location: "",
                urgency: "medium",
                currency: "NGN",
                amount: "",
                description: "",
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: NeedFormValues) => {
        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const urgencyValue = watch("urgency");
    const currencyValue = watch("currency");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Need" : "Create New Need"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-[#344054]">Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter name"
                                {...register("name")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.name && "border-red-500")}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age" className="text-sm font-medium text-[#344054]">Age</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="e.g. 25"
                                {...register("age")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.age && "border-red-500")}
                            />
                            {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium text-[#344054]">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Lagos, Nigeria"
                                {...register("location")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.location && "border-red-500")}
                            />
                            {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="urgency" className="text-sm font-medium text-[#344054]">Urgency</Label>
                            <Select onValueChange={(val) => setValue("urgency", val)} value={urgencyValue}>
                                <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                    <SelectValue placeholder="Select urgency" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.urgency && <p className="text-xs text-red-500">{errors.urgency.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-sm font-medium text-[#344054]">Currency</Label>
                            <Select onValueChange={(val) => setValue("currency", val)} value={currencyValue}>
                                <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-[#344054]">Target Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="50000"
                                {...register("amount")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.amount && "border-red-500")}
                            />
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-[#344054]">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the need..."
                            {...register("description")}
                            className="min-h-[120px] bg-white border-[#EAECF0] resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#344054]">Image</Label>
                        <div
                            className={cn(
                                "border-2 border-dashed border-[#D0D5DD] rounded-xl p-6 flex flex-col items-center justify-center bg-[#F9FAFB] cursor-pointer hover:bg-[#F2F4F7] transition-colors relative",
                                watch("image") && "border-solid border-primary bg-white"
                            )}
                            onClick={() => document.getElementById("need-image-upload")?.click()}
                        >
                            <input
                                type="file"
                                id="need-image-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setValue("image", file);
                                }}
                            />
                            {watch("image") ? (
                                <div className="flex flex-col items-center gap-2">
                                    <img
                                        src={watch("image") instanceof File ? URL.createObjectURL(watch("image")) : (typeof watch("image") === 'string' ? watch("image") : "")}
                                        alt="Need Preview"
                                        className="h-24 w-auto rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="text-xs text-red-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setValue("image", undefined);
                                        }}
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <CloudUpload className="h-8 w-8 text-[#667085] mb-2" />
                                    <p className="text-sm text-[#475467]">Click to upload or drag and drop</p>
                                    <p className="text-xs text-[#667085] mt-1">PNG, JPG or GIF (max. 2MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto h-11 border-[#EAECF0] text-[#344054] font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto h-11 bg-primary hover:bg-primary/90 text-white font-semibold min-w-[140px]"
                        >
                            {isSubmitting ? "Processing..." : (isEdit ? "Update Need" : "Create Need")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
