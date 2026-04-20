"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { disbursementService } from "@/services/disbursements"
import { campaignService } from "@/services/campaigns"
import { needService } from "@/services/needs"
import { toast } from "sonner"

const disbursementSchema = z.object({
    type: z.enum(["campaign", "need"]),
    disbursableId: z.string().min(1, "Source is required"),
    beneficiary: z.string().min(1, "Beneficiary name is required"),
    amount: z.string().min(1, "Amount is required"),
    currency: z.string().min(1, "Currency is required"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(10, "Account number must be 10 digits").max(10, "Account number must be 10 digits"),
    bankName: z.string().min(1, "Bank name is required"),
})

type DisbursementFormValues = z.infer<typeof disbursementSchema>

interface DisbursementModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const banks = [
    "Access Bank",
    "Guaranty Trust Bank (GTB)",
    "Zenith Bank",
    "First Bank",
    "United Bank for Africa (UBA)",
    "Kuda Bank",
    "Opay",
]

export function DisbursementModal({
    isOpen,
    onOpenChange,
}: DisbursementModalProps) {
    const queryClient = useQueryClient()

    const { data: campaignsRes } = useQuery({
        queryKey: ["campaigns-list"],
        queryFn: () => campaignService.listCampaigns({ status: "active" }),
        enabled: isOpen,
    })

    const { data: needsRes } = useQuery({
        queryKey: ["needs-list"],
        queryFn: () => needService.getNeeds(),
        enabled: isOpen,
    })

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<DisbursementFormValues>({
        resolver: zodResolver(disbursementSchema),
        defaultValues: {
            type: "campaign",
            disbursableId: "",
            beneficiary: "",
            amount: "",
            currency: "NGN",
            paymentMethod: "Bank Transfer",
            accountName: "",
            accountNumber: "",
            bankName: "",
        }
    })

    const typeValue = watch("type")
    const disbursableIdValue = watch("disbursableId")
    const paymentMethodValue = watch("paymentMethod")
    const bankNameValue = watch("bankName")
    const currencyValue = watch("currency")

    // Dynamically get the list based on type
    const sourceList = React.useMemo(() => {
        if (typeValue === "campaign") {
            return (campaignsRes?.data || []).map(c => ({ id: c.id, title: c.title }));
        } else {
            return (needsRes?.data || []).map(n => ({ id: n.id, title: n.name }));
        }
    }, [typeValue, campaignsRes, needsRes]);

    const createMutation = useMutation({
        mutationFn: (data: DisbursementFormValues) => {
            return disbursementService.requestDisbursement({
                disbursable_id: data.disbursableId,
                disbursable_type: data.type === "campaign" ? "App\\Models\\Campaign" : "App\\Models\\Need",
                beneficiary_name: data.beneficiary,
                amount: data.amount,
                currency: data.currency,
                payment_method: data.paymentMethod,
                account_name: data.accountName,
                account_number: data.accountNumber,
                bank_name: data.bankName,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["disbursements"] })
            queryClient.invalidateQueries({ queryKey: ["disbursement-stats"] })
            toast.success("Disbursement request submitted successfully")
            onOpenChange(false)
            reset()
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to submit request")
        },
    })

    const onSubmit = (data: DisbursementFormValues) => {
        createMutation.mutate(data)
    }

    const isSubmitting = createMutation.isPending

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        Create Disbursement Request
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Type & Source */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">Request Type</Label>
                            <Select 
                                onValueChange={(val: any) => {
                                    setValue("type", val);
                                    setValue("disbursableId", ""); // Reset source on type change
                                }}
                                value={typeValue}
                            >
                                <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="campaign">Campaign</SelectItem>
                                    <SelectItem value="need">Need</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <Label className="text-sm font-medium text-[#344054]">
                                Select {typeValue === "campaign" ? "Campaign" : "Need"}
                            </Label>
                            <Select 
                                onValueChange={(value) => setValue("disbursableId", value)}
                                value={disbursableIdValue}
                            >
                                <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                    <SelectValue placeholder={`Select ${typeValue}`} />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {sourceList.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.disbursableId && <p className="text-xs text-red-500">{errors.disbursableId.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="beneficiary" className="text-sm font-medium text-[#344054]">Beneficiary</Label>
                            <Input 
                                id="beneficiary"
                                placeholder="Jeff Ned"
                                {...register("beneficiary")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.beneficiary && "border-red-500")}
                            />
                            {errors.beneficiary && <p className="text-xs text-red-500">{errors.beneficiary.message}</p>}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-sm font-medium text-[#344054]">Currency</Label>
                                <Select 
                                    onValueChange={(val) => setValue("currency", val)}
                                    value={currencyValue}
                                >
                                    <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="NGN">NGN</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="amount" className="text-sm font-medium text-[#344054]">Amount</Label>
                                <Input 
                                    id="amount"
                                    type="number"
                                    placeholder="500000"
                                    {...register("amount")}
                                    className={cn("h-11 bg-white border-[#EAECF0]", errors.amount && "border-red-500")}
                                />
                                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod" className="text-sm font-medium text-[#344054]">Payment Method</Label>
                        <Select 
                            onValueChange={(value) => setValue("paymentMethod", value)}
                            value={paymentMethodValue}
                        >
                            <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                <SelectValue placeholder="Select Payment Method" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Wallet Transfer">Wallet Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod.message}</p>}
                    </div>

                    {/* Account Name & Account Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="accountName" className="text-sm font-medium text-[#344054]">Account Name</Label>
                            <Input 
                                id="accountName"
                                placeholder="Jeff Ned"
                                {...register("accountName")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.accountName && "border-red-500")}
                            />
                            {errors.accountName && <p className="text-xs text-red-500">{errors.accountName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber" className="text-sm font-medium text-[#344054]">Account Number</Label>
                            <Input 
                                id="accountNumber"
                                placeholder="1887131447"
                                {...register("accountNumber")}
                                className={cn("h-11 bg-white border-[#EAECF0]", errors.accountNumber && "border-red-500")}
                            />
                            {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber.message}</p>}
                        </div>
                    </div>

                    {/* Bank Name */}
                    <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-sm font-medium text-[#344054]">Bank Name</Label>
                        <Select 
                            onValueChange={(value) => setValue("bankName", value)}
                            value={bankNameValue}
                        >
                            <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                <SelectValue placeholder="Select Bank" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {banks.map((bank) => (
                                    <SelectItem key={bank} value={bank}>
                                        {bank}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.bankName && <p className="text-xs text-red-500">{errors.bankName.message}</p>}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-[120px] h-11 border-[#EAECF0] text-[#344054] font-semibold rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full sm:w-[150px] h-11 bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold rounded-lg"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
