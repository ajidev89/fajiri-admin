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
import { CloudUpload, X, FileIcon, ImageIcon, VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "@/services/media";
import { toast } from "sonner";

const mediaSchema = z.object({
    title: z.string().min(1, "Title is required"),
    file: z.any().refine((file) => file instanceof File, "File is required"),
});

type MediaFormValues = z.infer<typeof mediaSchema>;

interface MediaUploadModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MediaUploadModal({
    isOpen,
    onOpenChange,
}: MediaUploadModalProps) {
    const queryClient = useQueryClient();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<MediaFormValues>({
        resolver: zodResolver(mediaSchema),
        defaultValues: {
            title: "",
        },
    });

    const selectedFile = watch("file") as File | undefined;

    const uploadMutation = useMutation({
        mutationFn: (data: MediaFormValues) => {
            return mediaService.uploadMedia(data.title, data.file);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
            onOpenChange(false);
            toast.success("Media uploaded successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to upload media");
        },
    });

    const onSubmit = (data: MediaFormValues) => {
        uploadMutation.mutate(data);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("file", file);
            // Suggest title if empty
            if (!watch("title")) {
                const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
                setValue("title", nameWithoutExt);
            }
        }
    };

    const isSubmitting = uploadMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        Upload Media
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-[#344054]">
                            Display Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g. Campaign Hero Image"
                            {...register("title")}
                            className={cn(
                                "h-11 bg-white border-[#EAECF0]",
                                errors.title && "border-red-500"
                            )}
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title.message as string}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#344054]">
                            File (Image or Video)
                        </Label>
                        
                        <div
                            className={cn(
                                "border-2 border-dashed border-[#D0D5DD] rounded-xl p-8 flex flex-col items-center justify-center bg-[#F9FAFB] cursor-pointer hover:bg-[#F2F4F7] transition-colors relative group",
                                selectedFile && "border-solid border-primary bg-white"
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />
                            
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    {selectedFile.type.startsWith("image/") ? (
                                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-[#EAECF0]">
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-20 w-20 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-center">
                                            <VideoIcon className="h-10 w-10 text-[#667085]" />
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-sm text-[#101828] font-medium truncate max-w-[200px]">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-[#667085]">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setValue("file", undefined);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="h-12 w-12 rounded-full bg-white border border-[#EAECF0] flex items-center justify-center mb-4 shadow-sm">
                                        <CloudUpload className="h-6 w-6 text-[#667085]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-[#475467]">
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-[#667085] mt-1 text-center">
                                            PNG, JPG, MP4 (max. 50MB)
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        {errors.file && (
                            <p className="text-xs text-red-500">{errors.file.message as string}</p>
                        )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:flex-1 h-11 border-[#EAECF0] text-[#344054] font-semibold"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:flex-1 h-11 bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Uploading..." : "Start Upload"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
