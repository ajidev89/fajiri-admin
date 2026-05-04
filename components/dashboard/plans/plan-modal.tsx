"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { planService, Plan } from "@/services/plans";
import { toast } from "sonner";
import { CurrencySelect } from "@/components/form/currency-select";

const planSchema = z.object({
    name: z.string().min(1, "Name is required"),
    level: z.string().min(1, "Level is required"),
    account_type: z.string().min(1, "Account type is required"),
    description: z.string().optional(),
    price: z.string().min(1, "Price is required"),
    currency: z.string().min(1, "Currency is required"),
    duration: z.number().min(1, "Duration is required"),
    status: z.boolean(),
    rc_product_id_ios: z.string().optional(),
    features: z
        .array(
            z.object({ value: z.string().min(1, "Feature cannot be empty") }),
        )
        .min(1, "At least one feature is required"),
});

const LEVELS = ["Bronze", "Silver", "Gold", "Platinum"];
const ACCOUNT_TYPES = [
    { label: "Identified Membership", value: "identified-membership" },
    { label: "Project Membership", value: "project-membership" },
    { label: "Corporate Membership", value: "corporate-membership" },
];

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Plan | null;
}

export function PlanModal({
    isOpen,
    onOpenChange,
    initialData,
}: PlanModalProps) {
    const isEdit = !!initialData;
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: "",
            level: "",
            account_type: "",
            description: "",
            price: "",
            currency: "NGN",
            duration: 30,
            status: true,
            rc_product_id_ios: "",
            features: [{ value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "features",
    });

    const createMutation = useMutation({
        mutationFn: (data: PlanFormValues) => {
            const payload: any = {
                ...data,
                features: data.features.map((f) => f.value),
            };
            
            if (!payload.rc_product_id_ios) {
                delete payload.rc_product_id_ios;
            }

            return planService.createPlan(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            onOpenChange(false);
            toast.success("Plan created successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create plan");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: PlanFormValues) => {
            if (!initialData?.id) throw new Error("No Plan ID found");
            const payload: any = {
                ...data,
                features: data.features.map((f) => f.value),
            };

            if (!payload.rc_product_id_ios) {
                delete payload.rc_product_id_ios;
            }

            return planService.updatePlan(initialData.id, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            onOpenChange(false);
            toast.success("Plan updated successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update plan");
        },
    });

    React.useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                level: initialData.level || "",
                account_type: initialData.account_type || "",
                description: initialData.description || "",
                price: initialData.price.toString(),
                currency: initialData.currency,
                duration: initialData.duration,
                status: initialData.status,
                rc_product_id_ios: initialData.rc_product_id_ios || "",
                features: initialData.features?.length
                    ? initialData.features.map((f) => ({ value: f }))
                    : [{ value: "" }],
            });
        } else {
            reset({
                name: "",
                level: "",
                account_type: "",
                description: "",
                price: "",
                currency: "NGN",
                duration: 30,
                status: true,
                rc_product_id_ios: "",
                features: [{ value: "" }],
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: PlanFormValues) => {
        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Plan" : "Create Subscription Plan"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 space-y-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label
                                htmlFor="name"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Plan Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Premium Plan"
                                {...register("name")}
                                className={cn(
                                    "h-11 bg-white border-[#EAECF0]",
                                    errors.name && "border-red-500",
                                )}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="level"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Plan Level
                            </Label>
                            <Select
                                onValueChange={(val) => setValue("level", val)}
                                value={watch("level")}
                            >
                                <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {LEVELS.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.level && (
                                <p className="text-xs text-red-500">
                                    {errors.level.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="account_type"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Account Type
                            </Label>
                            <Select
                                onValueChange={(val) =>
                                    setValue("account_type", val)
                                }
                                value={watch("account_type")}
                            >
                                <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                    <SelectValue placeholder="Select Account Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {ACCOUNT_TYPES.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.account_type && (
                                <p className="text-xs text-red-500">
                                    {errors.account_type.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <CurrencySelect
                                name="currency"
                                label="Currency"
                                placeholder="NGN"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="price"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Price
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="5000"
                                {...register("price")}
                                className={cn(
                                    "h-11 bg-white border-[#EAECF0]",
                                    errors.price && "border-red-500",
                                )}
                            />
                            {errors.price && (
                                <p className="text-xs text-red-500">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="duration"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Duration (Days)
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                placeholder="30"
                                {...register("duration", {
                                    valueAsNumber: true,
                                })}
                                className={cn(
                                    "h-11 bg-white border-[#EAECF0]",
                                    errors.duration && "border-red-500",
                                )}
                            />
                            {errors.duration && (
                                <p className="text-xs text-red-500">
                                    {errors.duration.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-sm font-medium text-[#344054]"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Briefly describe what this plan offers..."
                            {...register("description")}
                            className="min-h-[100px] bg-white border-[#EAECF0] resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-[#344054]">
                                Features
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ value: "" })}
                                className="h-8 gap-1.5 text-xs border-[#EAECF0]"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Feature
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            {...register(
                                                `features.${index}.value` as const,
                                            )}
                                            placeholder="e.g. 24/7 Support"
                                            className={cn(
                                                "h-10 bg-white border-[#EAECF0]",
                                                errors.features?.[index]
                                                    ?.value && "border-red-500",
                                            )}
                                        />
                                        {errors.features?.[index]?.value && (
                                            <p className="text-[10px] text-red-500 mt-1">
                                                {
                                                    errors.features[index]
                                                        ?.value?.message
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {errors.features?.message && (
                            <p className="text-xs text-red-500">
                                {errors.features.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#EAECF0]">
                        <h3 className="text-sm font-semibold text-[#101828]">
                            RevenueCat Configuration
                        </h3>
                        <div className="space-y-2">
                            <Label
                                htmlFor="rc_product_id_ios"
                                className="text-sm font-medium text-[#344054]"
                            >
                                Product ID
                            </Label>
                            <Input
                                id="rc_product_id_ios"
                                placeholder="e.g. fjr_premium_monthly"
                                {...register("rc_product_id_ios")}
                                className="h-11 bg-white border-[#EAECF0]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-[#344054]">
                                Active Status
                            </Label>
                            <Switch
                                checked={watch("status")}
                                onCheckedChange={(val) =>
                                    setValue("status", val)
                                }
                            />
                        </div>
                        <p className="text-xs text-[#667085]">
                            Controls if this plan is visible to users.
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#EAECF0]">
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
                            {isSubmitting
                                ? "Saving..."
                                : isEdit
                                  ? "Update Plan"
                                  : "Create Plan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
