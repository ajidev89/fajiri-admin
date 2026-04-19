"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronRight,
    Eye,
    X,
    Plus,
    UploadCloud,
    Calendar,
    Clock,
    MapPin,
    Users,
    DollarSign,
} from "lucide-react";
import { eventService, categoryService, type Category } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { format } from "date-fns";

export default function EditEventPage() {
    const router = useRouter();
    const { slug } = useParams();
    const { user } = useAuthStore();

    const [eventId, setEventId] = React.useState("");
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const [status, setStatus] = React.useState("upcoming");
    const [slots, setSlots] = React.useState<number>(0);
    const [amount, setAmount] = React.useState<number | string>(0);
    const [isFeatured, setIsFeatured] = React.useState(false);
    const [image, setImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [mounted, setMounted] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [categoriesRes, eventRes] = await Promise.all([
                    categoryService.getCategories(),
                    eventService.getEvent(slug as string),
                ]);

                setCategories(categoriesRes.data);

                const event = eventRes.data;
                setEventId(event.id);
                setTitle(event.title);
                setDescription(event.description);
                setCategoryId(event.category_id);
                setLocation(event.location || "");
                
                // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
                if (event.start_date) {
                    setStartDate(format(new Date(event.start_date), "yyyy-MM-dd'T'HH:mm"));
                }
                if (event.end_date) {
                    setEndDate(format(new Date(event.end_date), "yyyy-MM-dd'T'HH:mm"));
                }

                setStatus(event.status);
                setSlots(event.slots);
                setAmount(event.amount);
                setIsFeatured(event.is_featured);
                
                if (event.image) {
                    setImagePreview(event.image);
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to fetch event data");
                router.push("/dashboard/content?tab=events");
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchData();
    }, [slug, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async () => {
        if (!title || !description || !categoryId || !startDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await eventService.updateEvent(eventId, {
                title,
                description,
                category_id: categoryId,
                location,
                start_date: startDate,
                end_date: endDate || undefined,
                status,
                slots,
                amount,
                is_featured: isFeatured,
                image: image || undefined,
            });
            toast.success("Event updated successfully");
            router.push("/dashboard/content?tab=events");
        } catch (error: any) {
            toast.error(error.message || "Failed to update event");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-[#667085]">Loading event data...</p>
                </div>
            </DashboardLayout>
        );
    }

    const name =
        mounted && user?.profile
            ? `${user.profile.first_name} ${user.profile.last_name}`
            : (mounted && user?.email) || "Admin";

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                {/* Header / Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            href="/dashboard/content"
                            className="text-[#667085] hover:text-primary transition-colors"
                        >
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">
                            Edit Event
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="h-10 border-[#EAECF0] text-[#344054] font-semibold flex items-center gap-2 px-6"
                        >
                            <Eye className="h-4 w-4" /> Preview
                        </Button>
                        <Button
                            className="h-10 bg-primary hover:bg-primary/90 text-white font-semibold px-8"
                            onClick={handleUpdate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Update Event"}
                        </Button>
                        <button
                            className="text-sm font-semibold text-red-600 hover:text-red-700 ml-2"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                    {/* Left Column - Main Editor */}
                    <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                        <Tabs defaultValue="content" className="w-full">
                            <div className="px-8 pt-6 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828] mb-6">
                                    Event Details
                                </h4>
                                <TabsList className="h-auto bg-transparent p-0 gap-8 justify-start border-none">
                                    <TabsTrigger
                                        value="content"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Information
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent
                                value="content"
                                className="p-8 space-y-8 focus-visible:ring-0"
                            >
                                {/* Title Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">
                                        Event Title
                                    </Label>
                                    <Input
                                        placeholder="Enter event title"
                                        className="h-14 bg-white border-[#D0D5DD] text-lg font-medium shadow-none focus-visible:ring-primary/20 placeholder:text-[#98A2B3]"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Description Editor */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">
                                        Description
                                    </Label>
                                    <RichTextEditor
                                        value={description}
                                        onChange={setDescription}
                                        placeholder="Describe your event..."
                                    />
                                </div>

                                {/* Location Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">
                                        Location
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter event location (or 'Virtual')"
                                            className="h-12 pl-10 bg-white border-[#D0D5DD] shadow-none focus-visible:ring-primary/20"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">
                                        Event Image
                                    </Label>
                                    <div
                                        className="border-2 border-dashed border-[#D0D5DD] rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-[#F9FAFB] group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden h-[250px]"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <div className="h-12 w-12 rounded-full bg-white border border-[#EAECF0] shadow-sm flex items-center justify-center text-[#667085] group-hover:text-primary transition-colors">
                                                    <UploadCloud className="h-6 w-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-[#475467]">
                                                        Drag & Drop or <span className="text-primary font-bold">Browse</span>
                                                    </p>
                                                    <p className="text-xs text-[#667085] mt-1">
                                                        Max. File Size: 10MB
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828]">
                                    Logistics
                                </h4>
                            </div>
                            <div className="p-8 space-y-6">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#344085] uppercase tracking-wider">
                                        Start Date & Time
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="datetime-local"
                                            className="h-12 pl-10 border-[#D0D5DD] shadow-none focus:ring-primary/20"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#344085] uppercase tracking-wider">
                                        End Date & Time (Optional)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="datetime-local"
                                            className="h-12 pl-10 border-[#D0D5DD] shadow-none focus:ring-primary/20"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#344085] uppercase tracking-wider">
                                        Category
                                    </Label>
                                    <Select
                                        value={categoryId}
                                        onValueChange={setCategoryId}
                                    >
                                        <SelectTrigger className="h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828]">
                                    Settings
                                </h4>
                            </div>
                            <div className="p-8 space-y-6">
                                {/* Slots */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#344085] uppercase tracking-wider">
                                        Total Slots
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-12 pl-10 border-[#D0D5DD] shadow-none focus:ring-primary/20"
                                            value={slots}
                                            onChange={(e) => setSlots(Number(e.target.value))}
                                        />
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#344085] uppercase tracking-wider">
                                        Pricing (0 for free)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-12 pl-10 border-[#D0D5DD] shadow-none focus:ring-primary/20"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#344085] uppercase tracking-wider">
                                        Public Status
                                    </Label>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger className="h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
