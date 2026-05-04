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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CurrencySelect } from "@/components/form/currency-select";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fundraiserService } from "@/services/fundraisers";
import { countryService } from "@/services/countries";
import { toast } from "sonner";

const fundraiserSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    username: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
    country_id: z.string().min(1, "Country is required"),
    currency: z.string().min(1, "Currency is required"),
});

type FundraiserFormValues = z.infer<typeof fundraiserSchema>;

interface FundraiserModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FundraiserModal({
    isOpen,
    onOpenChange,
}: FundraiserModalProps) {
    const queryClient = useQueryClient();

    const { data: countriesRes } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
        enabled: isOpen,
    });

    const countries = countriesRes?.data || [];

    const methods = useForm<FundraiserFormValues>({
        resolver: zodResolver(fundraiserSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            username: "",
            password: "",
            country_id: "",
            currency: "NGN",
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

    const countryIdValue = watch("country_id");

    const createMutation = useMutation({
        mutationFn: (data: FundraiserFormValues) => {
            return fundraiserService.createFundraiser({
                ...data,
                password: data.password || undefined,
                username: data.username || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fundraisers"] });
            onOpenChange(false);
            toast.success("Fundraiser created successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create fundraiser");
        },
    });

    const onSubmit = (data: FundraiserFormValues) => {
        createMutation.mutate(data);
    };

    const isSubmitting = createMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        Create Fundraiser Account
                    </DialogTitle>
                </DialogHeader>
                <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 space-y-5"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">
                                First Name
                            </Label>
                            <Input
                                placeholder="Enter first name"
                                {...register("first_name")}
                                className={cn(
                                    "h-11 bg-white border-[#EAECF0]",
                                    errors.first_name && "border-red-500"
                                )}
                            />
                            {errors.first_name && (
                                <p className="text-xs text-red-500">{errors.first_name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">
                                Last Name
                            </Label>
                            <Input
                                placeholder="Enter last name"
                                {...register("last_name")}
                                className={cn(
                                    "h-11 bg-white border-[#EAECF0]",
                                    errors.last_name && "border-red-500"
                                )}
                            />
                            {errors.last_name && (
                                <p className="text-xs text-red-500">{errors.last_name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#344054]">
                            Email Address
                        </Label>
                        <Input
                            type="email"
                            placeholder="e.g. name@example.com"
                            {...register("email")}
                            className={cn(
                                "h-11 bg-white border-[#EAECF0]",
                                errors.email && "border-red-500"
                            )}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">
                                Username (Optional)
                            </Label>
                            <Input
                                placeholder="Enter username"
                                {...register("username")}
                                className="h-11 bg-white border-[#EAECF0]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">
                                Password (Optional)
                            </Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                                className={cn(
                                    "h-11 bg-white border-[#EAECF0]",
                                    errors.password && "border-red-500"
                                )}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">
                                Country
                            </Label>
                            <Select
                                onValueChange={(value) => setValue("country_id", value)}
                                value={countryIdValue}
                            >
                                <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {countries.map((country) => (
                                        <SelectItem key={country.id} value={country.id.toString()}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country_id && (
                                <p className="text-xs text-red-500">{errors.country_id.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <CurrencySelect
                                name="currency"
                                label="Currency"
                                placeholder="Select currency"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 border-[#EAECF0] text-[#344054] font-semibold px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold px-8"
                        >
                            {isSubmitting ? "Creating..." : "Create Account"}
                        </Button>
                    </div>
                </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
