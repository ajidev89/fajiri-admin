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
import { initiativeService, Initiative } from "@/services/initiatives";
import { toast } from "sonner";

const initiativeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    status: z.string().default("active"),
    image: z.any().optional(),
});

type InitiativeFormValues = z.infer<typeof initiativeSchema>;

interface InitiativeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Initiative | null;
}

export function InitiativeModal({
    isOpen,
    onOpenChange,
    initialData,
}: InitiativeModalProps) {
    const isEdit = !!initialData;
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<InitiativeFormValues>({
        resolver: zodResolver(initiativeSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "active",
        },
    });

    const createMutation = useMutation({
        mutationFn: (values: InitiativeFormValues) => {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("status", values.status);
            if (values.image instanceof File) {
                formData.append("image", values.image);
            }
            return initiativeService.createInitiative(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["initiatives"] });
            onOpenChange(false);
            toast.success("Initiative created successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create initiative");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values: InitiativeFormValues) => {
            if (!initialData?.id) throw new Error("No Initiative ID found");
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("status", values.status);
            if (values.image instanceof File) {
                formData.append("image", values.image);
            }
            return initiativeService.updateInitiative(initialData.id, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["initiatives"] });
            onOpenChange(false);
            toast.success("Initiative updated successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update initiative");
        },
    });

    React.useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title,
                description: initialData.description,
                status: initialData.status,
            });
        } else {
            reset({
                title: "",
                description: "",
                status: "active",
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: InitiativeFormValues) => {
        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const statusValue = watch("status");
    const imageValue = watch("image");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Initiative" : "Create New Initiative"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-[#344054]">Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter initiative title"
                            {...register("title")}
                            className={cn("h-11 bg-white border-[#EAECF0]", errors.title && "border-red-500")}
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-[#344054]">Status</Label>
                        <Select onValueChange={(val) => setValue("status", val)} value={statusValue}>
                            <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-[#344054]">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the initiative..."
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
                                (imageValue || (isEdit && initialData?.image)) && "border-solid border-primary bg-white"
                            )}
                            onClick={() => document.getElementById("initiative-image-upload")?.click()}
                        >
                            <input
                                type="file"
                                id="initiative-image-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setValue("image", file);
                                }}
                            />
                            {imageValue || (isEdit && initialData?.image) ? (
                                <div className="flex flex-col items-center gap-2">
                                    <img
                                        src={imageValue instanceof File ? URL.createObjectURL(imageValue) : (typeof imageValue === 'string' ? imageValue : (initialData?.image || ""))}
                                        alt="Initiative Preview"
                                        className="h-32 w-auto rounded-lg object-cover"
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
                            {isSubmitting ? "Processing..." : (isEdit ? "Update Initiative" : "Create Initiative")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
