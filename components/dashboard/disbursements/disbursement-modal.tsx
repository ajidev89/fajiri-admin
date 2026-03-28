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

const disbursementSchema = z.object({
    campaignId: z.string().min(1, "Campaign is required"),
    beneficiary: z.string().min(1, "Beneficiary name is required"),
    amount: z.string().min(1, "Amount is required"),
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

const campaigns = [
    { id: "1", title: "The strength of a people. The power of community." },
    { id: "2", title: "Feed 1,000 Families This Ramadan" },
    { id: "3", title: "Build a Community Health Center" },
]

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
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<DisbursementFormValues>({
        resolver: zodResolver(disbursementSchema),
        defaultValues: {
            campaignId: "",
            beneficiary: "",
            amount: "",
            paymentMethod: "Bank Transfer",
            accountName: "",
            accountNumber: "",
            bankName: "",
        }
    })

    const onSubmit = async (data: DisbursementFormValues) => {
        console.log("Submitting disbursement request:", data)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        onOpenChange(false)
        reset()
    }

    const campaignValue = watch("campaignId")
    const paymentMethodValue = watch("paymentMethod")
    const bankNameValue = watch("bankName")

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        Create Disbursement Request
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Campaign */}
                    <div className="space-y-2">
                        <Label htmlFor="campaign" className="text-sm font-medium text-[#344054]">Campaign</Label>
                        <Select 
                            onValueChange={(value) => setValue("campaignId", value)}
                            value={campaignValue}
                        >
                            <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                <SelectValue placeholder="Select Campaign" />
                            </SelectTrigger>
                            <SelectContent>
                                {campaigns.map((campaign) => (
                                    <SelectItem key={campaign.id} value={campaign.id}>
                                        {campaign.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.campaignId && <p className="text-xs text-red-500">{errors.campaignId.message}</p>}
                    </div>

                    {/* Beneficiary & Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="beneficiary" className="text-sm font-medium text-[#344054]">Beneficiary</Label>
                            <Input 
                                id="beneficiary"
                                placeholder="Jeff Ned"
                                {...register("beneficiary")}
                                className="h-11 bg-white border-[#EAECF0]"
                            />
                            {errors.beneficiary && <p className="text-xs text-red-500">{errors.beneficiary.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-[#344054]">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]">₦</span>
                                <Input 
                                    id="amount"
                                    placeholder="500,000"
                                    {...register("amount")}
                                    className="h-11 pl-8 bg-white border-[#EAECF0]"
                                />
                            </div>
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
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
                            <SelectContent>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Wallet Transfer">Wallet Transfer</SelectItem>
                                <SelectItem value="Card Payment">Card Payment</SelectItem>
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
                                className="h-11 bg-white border-[#EAECF0]"
                            />
                            {errors.accountName && <p className="text-xs text-red-500">{errors.accountName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber" className="text-sm font-medium text-[#344054]">Account Number</Label>
                            <Input 
                                id="accountNumber"
                                placeholder="1887131447"
                                {...register("accountNumber")}
                                className="h-11 bg-white border-[#EAECF0]"
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
                            <SelectContent>
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
                            className="w-full sm:w-[120px] h-11 bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold rounded-lg"
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
