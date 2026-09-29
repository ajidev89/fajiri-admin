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
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ambassadorService, Ambassador } from "@/services/ambassadors";
import { toast } from "sonner";

const ambassadorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().min(1, "Title is required"),
    biography: z.string().min(1, "Biography is required"),
    sort_order: z.coerce.number().int().min(0),
    photo: z.any().optional(),
});

type AmbassadorFormValues = z.output<typeof ambassadorSchema>;
type AmbassadorFormInput = z.input<typeof ambassadorSchema>;

interface AmbassadorModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Ambassador | null;
}

export function AmbassadorModal({
    isOpen,
    onOpenChange,
    initialData,
}: AmbassadorModalProps) {
    const isEdit = !!initialData;
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AmbassadorFormInput, unknown, AmbassadorFormValues>({
        resolver: zodResolver(ambassadorSchema),
        defaultValues: {
            name: "",
            title: "",
            biography: "",
            sort_order: 0,
        },
    });

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        reset({
            name: initialData?.name ?? "",
            title: initialData?.title ?? "",
            biography: initialData?.biography ?? "",
            sort_order: initialData?.sort_order ?? 0,
            photo: undefined,
        });
    }, [initialData, isOpen, reset]);

    const createMutation = useMutation({
        mutationFn: (values: AmbassadorFormValues) =>
            ambassadorService.createAmbassador({
                name: values.name,
                title: values.title,
                biography: values.biography,
                sort_order: values.sort_order,
                photo: values.photo instanceof File ? values.photo : undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ambassadors"] });
            onOpenChange(false);
            toast.success("Ambassador created");
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create ambassador");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values: AmbassadorFormValues) => {
            if (!initialData?.id) {
                throw new Error("No ambassador selected");
            }

            return ambassadorService.updateAmbassador(initialData.id, {
                name: values.name,
                title: values.title,
                biography: values.biography,
                sort_order: values.sort_order,
                photo: values.photo instanceof File ? values.photo : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ambassadors"] });
            onOpenChange(false);
            toast.success("Ambassador updated");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update ambassador");
        },
    });

    const onSubmit = (values: AmbassadorFormValues) => {
        if (!isEdit && !(values.photo instanceof File)) {
            toast.error("A photo is required");
            return;
        }

        if (isEdit) {
            updateMutation.mutate(values);
            return;
        }

        createMutation.mutate(values);
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const photoValue = watch("photo");
    const previewUrl =
        photoValue instanceof File
            ? URL.createObjectURL(photoValue)
            : initialData?.photo;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Ambassador" : "Add Ambassador"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="ambassador-name">Name</Label>
                        <Input
                            id="ambassador-name"
                            placeholder="Frank Ajirioghene Urefe"
                            {...register("name")}
                            className={cn("h-11 bg-white border-[#EAECF0]", errors.name && "border-red-500")}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ambassador-title">Title</Label>
                        <Input
                            id="ambassador-title"
                            placeholder="Chief Executive Officer"
                            {...register("title")}
                            className={cn("h-11 bg-white border-[#EAECF0]", errors.title && "border-red-500")}
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ambassador-biography">Biography</Label>
                        <Textarea
                            id="ambassador-biography"
                            placeholder="Write the biography shown when the portrait is opened"
                            {...register("biography")}
                            className="min-h-[140px] bg-white border-[#EAECF0]"
                        />
                        {errors.biography && <p className="text-xs text-red-500">{errors.biography.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ambassador-order">Order</Label>
                        <Input
                            id="ambassador-order"
                            type="number"
                            min={0}
                            {...register("sort_order")}
                            className="h-11 bg-white border-[#EAECF0]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Photo</Label>
                        <div
                            className={cn(
                                "border-2 border-dashed border-[#D0D5DD] rounded-xl p-6 flex flex-col items-center justify-center bg-[#F9FAFB] cursor-pointer hover:bg-[#F2F4F7] transition-colors",
                                previewUrl && "border-solid border-primary bg-white",
                            )}
                            onClick={() => document.getElementById("ambassador-photo-upload")?.click()}
                        >
                            <input
                                type="file"
                                id="ambassador-photo-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) {
                                        setValue("photo", file);
                                    }
                                }}
                            />
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Ambassador preview"
                                    className="h-40 w-auto rounded-lg object-cover"
                                />
                            ) : (
                                <>
                                    <CloudUpload className="h-8 w-8 text-[#667085] mb-2" />
                                    <p className="text-sm text-[#475467]">Click to upload a portrait</p>
                                    <p className="text-xs text-[#667085] mt-1">PNG, JPG or WEBP (max. 2MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto h-11"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-11">
                            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add ambassador"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
