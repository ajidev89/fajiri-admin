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
import { CloudUpload, Globe, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insuranceService, Insurance } from "@/services/insurances";
import { countryService } from "@/services/countries";
import { toast } from "sonner";

const insuranceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    website: z.string().url("Must be a valid URL"),
    phone: z.string().optional(),
    email: z.string().email("Must be a valid email").optional(),
    address: z.string().min(1, "Address is required"),
    type: z.string().min(1, "Type is required"),
    description: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country_id: z.string().min(1, "Country is required"),
    status: z.string().default("active"),
    logo: z.any().optional(),
});

type InsuranceFormValues = z.infer<typeof insuranceSchema>;

interface InsuranceModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Insurance | null;
}

export function InsuranceModal({
    isOpen,
    onOpenChange,
    initialData,
}: InsuranceModalProps) {
    const isEdit = !!initialData;
    const queryClient = useQueryClient();

    // Fetch countries for the dropdown
    const { data: countriesRes } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<InsuranceFormValues>({
        resolver: zodResolver(insuranceSchema),
        defaultValues: {
            name: "",
            slug: "",
            website: "",
            phone: "",
            email: "",
            address: "",
            type: "life",
            description: "",
            city: "",
            state: "",
            country_id: "",
            status: "active",
        },
    });

    const createMutation = useMutation({
        mutationFn: (values: InsuranceFormValues) => {
            return insuranceService.createInsurance({
                ...values,
                logo: values.logo instanceof File ? values.logo : undefined,
                phone: values.phone || "",
                email: values.email || "",
                description: values.description || "",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["insurances"] });
            onOpenChange(false);
            toast.success("Insurance provider created successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create insurance provider");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (values: InsuranceFormValues) => {
            if (!initialData?.id) throw new Error("No Insurance ID found");
            return insuranceService.updateInsurance(initialData.id, {
                ...values,
                logo: values.logo instanceof File ? values.logo : undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["insurances"] });
            onOpenChange(false);
            toast.success("Insurance provider updated successfully");
            reset();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update insurance provider");
        },
    });

    React.useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                slug: initialData.slug,
                website: initialData.website,
                phone: initialData.phone || "",
                email: initialData.email || "",
                address: initialData.address,
                type: initialData.type,
                description: initialData.description || "",
                city: initialData.city,
                state: initialData.state,
                country_id: initialData.country?.id.toString() || "",
                status: initialData.status || "active",
            });
        } else {
            reset({
                name: "",
                slug: "",
                website: "",
                phone: "",
                email: "",
                address: "",
                type: "life",
                description: "",
                city: "",
                state: "",
                country_id: "",
                status: "active",
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: InsuranceFormValues) => {
        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const typeValue = watch("type");
    const statusValue = watch("status");
    const countryValue = watch("country_id");
    const logoValue = watch("logo");

    // Auto-generate slug from name
    React.useEffect(() => {
        const name = watch("name");
        if (name && !isEdit) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
            setValue("slug", slug);
        }
    }, [watch("name"), isEdit, setValue]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Insurance Provider" : "Add Insurance Provider"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Building2 className="h-5 w-5" />
                            <h4>Provider Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-[#344054]">Company Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Heirs Insurance"
                                    {...register("name")}
                                    className={cn("h-11 bg-white border-[#EAECF0]", errors.name && "border-red-500")}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-sm font-medium text-[#344054]">Slug</Label>
                                <Input
                                    id="slug"
                                    placeholder="auto-generated-slug"
                                    {...register("slug")}
                                    className={cn("h-11 bg-[#F9FAFB] border-[#EAECF0]", errors.slug && "border-red-500")}
                                />
                                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-sm font-medium text-[#344054]">Insurance Type</Label>
                                <Select onValueChange={(val) => setValue("type", val)} value={typeValue}>
                                    <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="life">Life Insurance</SelectItem>
                                        <SelectItem value="health">Health Insurance</SelectItem>
                                        <SelectItem value="property">Property Insurance</SelectItem>
                                        <SelectItem value="auto">Auto Insurance</SelectItem>
                                        <SelectItem value="travel">Travel Insurance</SelectItem>
                                    </SelectContent>
                                </Select>
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
                        </div>
                    </div>

                    {/* Contact Info Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Mail className="h-5 w-5" />
                            <h4>Contact Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-[#344054]">Email</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        placeholder="contact@company.com"
                                        {...register("email")}
                                        className={cn("h-11 pl-10 bg-white border-[#EAECF0]", errors.email && "border-red-500")}
                                    />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                </div>
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-[#344054]">Phone</Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        placeholder="+234..."
                                        {...register("phone")}
                                        className="h-11 pl-10 bg-white border-[#EAECF0]"
                                    />
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website" className="text-sm font-medium text-[#344054]">Website URL</Label>
                                <div className="relative">
                                    <Input
                                        id="website"
                                        placeholder="https://company.com"
                                        {...register("website")}
                                        className={cn("h-11 pl-10 bg-white border-[#EAECF0]", errors.website && "border-red-500")}
                                    />
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                </div>
                                {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <MapPin className="h-5 w-5" />
                            <h4>Location Details</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address" className="text-sm font-medium text-[#344054]">Street Address</Label>
                                <Input
                                    id="address"
                                    placeholder="Enter physical address"
                                    {...register("address")}
                                    className={cn("h-11 bg-white border-[#EAECF0]", errors.address && "border-red-500")}
                                />
                                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium text-[#344054]">City</Label>
                                <Input
                                    id="city"
                                    placeholder="Lagos"
                                    {...register("city")}
                                    className={cn("h-11 bg-white border-[#EAECF0]", errors.city && "border-red-500")}
                                />
                                {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-sm font-medium text-[#344054]">State / Province</Label>
                                <Input
                                    id="state"
                                    placeholder="Lagos State"
                                    {...register("state")}
                                    className={cn("h-11 bg-white border-[#EAECF0]", errors.state && "border-red-500")}
                                />
                                {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country_id" className="text-sm font-medium text-[#344054]">Country</Label>
                                <Select onValueChange={(val) => setValue("country_id", val)} value={countryValue}>
                                    <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {countriesRes?.data?.map((country) => (
                                            <SelectItem key={country.id} value={country.id.toString()}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.country_id && <p className="text-xs text-red-500">{errors.country_id.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Logo & Description */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-[#344054]">Provider Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Write a short description about this insurance provider..."
                                {...register("description")}
                                className="min-h-[150px] bg-white border-[#EAECF0] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">Company Logo</Label>
                            <div
                                className={cn(
                                    "border-2 border-dashed border-[#D0D5DD] rounded-2xl p-6 flex flex-col items-center justify-center bg-[#F9FAFB] cursor-pointer hover:bg-[#F2F4F7] transition-colors relative h-[150px]",
                                    (logoValue || (isEdit && initialData?.logo)) && "border-solid border-primary bg-white"
                                )}
                                onClick={() => document.getElementById("insurance-logo-upload")?.click()}
                            >
                                <input
                                    type="file"
                                    id="insurance-logo-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setValue("logo", file);
                                    }}
                                />
                                {logoValue || (isEdit && initialData?.logo) ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img
                                            src={logoValue instanceof File ? URL.createObjectURL(logoValue) : (typeof logoValue === 'string' ? logoValue : (initialData?.logo || ""))}
                                            alt="Logo Preview"
                                            className="h-16 w-auto rounded-lg object-contain"
                                        />
                                        <button
                                            type="button"
                                            className="text-xs text-red-500 hover:underline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setValue("logo", undefined);
                                            }}
                                        >
                                            Remove Logo
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <CloudUpload className="h-8 w-8 text-[#667085] mb-2" />
                                        <p className="text-xs text-[#475467] text-center px-4">Click to upload brand logo</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-[#EAECF0] flex flex-col sm:flex-row items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto h-12 px-8 border-[#EAECF0] text-[#344054] font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto h-12 px-12 bg-primary hover:bg-primary/90 text-white font-semibold min-w-[200px]"
                        >
                            {isSubmitting ? "Processing..." : (isEdit ? "Update Provider" : "Add Provider")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
