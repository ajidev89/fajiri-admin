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
import { testimonyService, Testimony } from "@/services/testimonies";
import { toast } from "sonner";

const testimonySchema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.coerce.number().int().min(1, "Age is required").max(120),
    story: z.string().min(1, "Story is required"),
    sort_order: z.coerce.number().int().min(0),
    photo: z.any().optional(),
});

type TestimonyFormValues = z.output<typeof testimonySchema>;
type TestimonyFormInput = z.input<typeof testimonySchema>;

interface TestimonyModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Testimony | null;
}

export function TestimonyModal({
    isOpen,
    onOpenChange,
    initialData,
}: TestimonyModalProps) {
    const isEdit = !!initialData;
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<TestimonyFormInput, unknown, TestimonyFormValues>({
        resolver: zodResolver(testimonySchema),
        defaultValues: {
            name: "",
            age: 0,
            story: "",
            sort_order: 0,
        },
    });

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        reset({
            name: initialData?.name ?? "",
            age: initialData?.age ?? 0,
            story: initialData?.story ?? "",
            sort_order: initialData?.sort_order ?? 0,
            photo: undefined,
        });
    }, [initialData, isOpen, reset]);

    const createMutation = useMutation({
        mutationFn: (values: TestimonyFormValues) =>
            testimonyService.createTestimony({
                name: values.name,
                age: values.age,
                story: values.story,
                sort_order: values.sort_order,
                photo: values.photo instanceof File ? values.photo : undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonies"] });
            onOpenChange(false);
            toast.success("Testimony created");
            reset();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create testimony");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values: TestimonyFormValues) => {
            if (!initialData?.id) {
                throw new Error("No testimony selected");
            }

            return testimonyService.updateTestimony(initialData.id, {
                name: values.name,
                age: values.age,
                story: values.story,
                sort_order: values.sort_order,
                photo: values.photo instanceof File ? values.photo : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonies"] });
            onOpenChange(false);
            toast.success("Testimony updated");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update testimony");
        },
    });

    const onSubmit = (values: TestimonyFormValues) => {
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
                        {isEdit ? "Edit Testimony" : "Add Testimony"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="testimony-name">Name</Label>
                            <Input
                                id="testimony-name"
                                placeholder="John Bieber"
                                {...register("name")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.name && "border-red-500")}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="testimony-age">Age</Label>
                            <Input
                                id="testimony-age"
                                type="number"
                                min={1}
                                max={120}
                                placeholder="15"
                                {...register("age")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.age && "border-red-500")}
                            />
                            {errors.age && <p className="text-xs text-red-500">{errors.age.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="testimony-story">Story</Label>
                        <Textarea
                            id="testimony-story"
                            placeholder="Write the story shown on the portrait"
                            {...register("story")}
                            className="min-h-[140px] bg-white border-[#EAECF0]"
                        />
                        {errors.story && <p className="text-xs text-red-500">{errors.story.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="testimony-order">Order</Label>
                        <Input
                            id="testimony-order"
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
                            onClick={() => document.getElementById("testimony-photo-upload")?.click()}
                        >
                            <input
                                type="file"
                                id="testimony-photo-upload"
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
                                    alt="Testimony preview"
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
                            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add testimony"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
