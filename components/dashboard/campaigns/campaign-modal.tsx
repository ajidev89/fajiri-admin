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
import { Textarea } from "@/components/ui/textarea"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { CloudUpload, X } from "lucide-react"
import { cn } from "@/lib/utils"

const campaignSchema = z.object({
    title: z.string().min(1, "Title is required"),
    category: z.string().min(1, "Category is required"),
    goalAmount: z.string().min(1, "Goal amount is required"),
    duration: z.string().min(1, "Duration is required"),
    description: z.string().min(1, "Description is required").max(8000, "Max 8000 words"),
    thumbnail: z.any().optional(),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

interface CampaignModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any // Campaign data for edit mode
}

export function CampaignModal({
    isOpen,
    onOpenChange,
    initialData
}: CampaignModalProps) {
    const isEdit = !!initialData

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: initialData || {
            title: "",
            category: "",
            goalAmount: "",
            duration: "",
            description: "",
        }
    })

    // Update form when initialData changes
    React.useEffect(() => {
        if (initialData) {
            reset(initialData)
        } else {
            reset({
                title: "",
                category: "",
                goalAmount: "",
                duration: "",
                description: "",
            })
        }
    }, [initialData, reset])

    const onSubmit = async (data: CampaignFormValues) => {
        console.log("Form data:", data)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        onOpenChange(false)
        reset()
    }

    const categoryValue = watch("category")

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-3xl">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {isEdit ? "Edit Campaign" : "Create Campaign"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-[#344054]">Title</Label>
                        <Input 
                            id="title"
                            placeholder="The strength of a people. The power of community."
                            {...register("title")}
                            className={cn(
                                "h-11 bg-white border-[#EAECF0]",
                                errors.title && "border-red-500 focus-visible:ring-red-500"
                            )}
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium text-[#344054]">Category</Label>
                        <Select 
                            onValueChange={(value) => setValue("category", value)}
                            value={categoryValue}
                        >
                            <SelectTrigger className="h-11 bg-white border-[#EAECF0]">
                                <SelectValue placeholder="Community Support" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Medical">Medical</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Development">Development</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Community Support">Community Support</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                    </div>

                    {/* Goal & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="goalAmount" className="text-sm font-medium text-[#344054]">Goal</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]">₦</span>
                                <Input 
                                    id="goalAmount"
                                    placeholder="500,000"
                                    {...register("goalAmount")}
                                    className="h-11 pl-8 bg-white border-[#EAECF0]"
                                />
                            </div>
                            {errors.goalAmount && <p className="text-xs text-red-500">{errors.goalAmount.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-sm font-medium text-[#344054]">Duration</Label>
                            <Input 
                                id="duration"
                                placeholder="50 days"
                                {...register("duration")}
                                className="h-11 bg-white border-[#EAECF0]"
                            />
                            {errors.duration && <p className="text-xs text-red-500">{errors.duration.message}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-[#344054]">Description</Label>
                        <div className="relative">
                            <Textarea 
                                id="description"
                                placeholder="Describe your campaign..."
                                {...register("description")}
                                className="min-h-[160px] bg-white border-[#EAECF0] resize-none"
                            />
                            <div className="absolute bottom-3 left-3 text-[10px] text-[#667085]">
                                {(watch("description") || "").length} words
                            </div>
                        </div>
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#344054]">Thumbnail</Label>
                        <div className="border-2 border-dashed border-[#D0D5DD] rounded-xl p-8 flex flex-col items-center justify-center bg-[#F9FAFB] cursor-pointer hover:bg-[#F2F4F7] transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-white border border-[#EAECF0] flex items-center justify-center mb-3">
                                <CloudUpload className="h-5 w-5 text-[#667085]" />
                            </div>
                            <p className="text-sm text-[#475467]">
                                <span className="font-semibold text-[#0E3B5D]">Drag & Drop your files</span> or <span className="font-semibold text-[#0E3B5D] underline">Browse</span>
                            </p>
                            <p className="text-xs text-[#667085] mt-1">Max. File Size: 10MB</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto min-w-[100px] h-11 border-[#EAECF0] text-[#344054] font-semibold"
                        >
                            Cancel
                        </Button>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1 sm:flex-none min-w-[120px] h-11 border-[#EAECF0] text-[#344054] font-semibold"
                            >
                                Save as Draft
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none min-w-[120px] h-11 bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold"
                            >
                                {isEdit ? "Update Campaign" : "Publish"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
