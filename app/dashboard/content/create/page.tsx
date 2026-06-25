"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
    Bold,
    Italic,
    AlignLeft,
    AlignCenter,
    List,
    Link as LinkIcon,
    Quote,
    UploadCloud,
    Calendar,
    Clock,
} from "lucide-react";
import { blogService, categoryService, type Category, countryService, type Country } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export default function CreateBlogPostPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [status, setStatus] = React.useState("published");
    const [image, setImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [countries, setCountries] = React.useState<Country[]>([]);
    const [countryId, setCountryId] = React.useState<string>("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setMounted(true);
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories();
                setCategories(response.data);
                if (response.data.length > 0) {
                    setCategoryId(response.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        const fetchCountries = async () => {
            try {
                const res = await countryService.getCountries();
                setCountries(res.data || []);
            } catch (error) {
                console.error("Failed to fetch countries", error);
            }
        };
        fetchCategories();
        fetchCountries();
    }, []);

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

    const handlePublish = async () => {
        if (!title || !content || !categoryId) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await blogService.createPost({
                title,
                content,
                category_id: categoryId,
                status,
                image: image || undefined,
                country_id: countryId && countryId !== "none" ? countryId : undefined,
            });
            toast.success("Post created successfully");
            router.push("/dashboard/content");
        } catch (error: any) {
            toast.error(error.message || "Failed to create post");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            Create New Post
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
                            onClick={handlePublish}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Publishing..." : "Publish"}
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
                                    Blog Post Page
                                </h4>
                                <TabsList className="h-auto bg-transparent p-0 gap-8 justify-start border-none">
                                    <TabsTrigger
                                        value="content"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Content
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="seo"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        SEO
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
                                        Title
                                    </Label>
                                    <Input
                                        placeholder="Enter blog post title"
                                        className="h-14 bg-white border-[#D0D5DD] text-lg font-medium shadow-none focus-visible:ring-primary/20 placeholder:text-[#98A2B3]"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Text Editor */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">
                                        Text
                                    </Label>
                                    <RichTextEditor
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Start writing your story..."
                                    />
                                </div>

                                {/* Image Upload (Placeholder) */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">
                                        Upload Image
                                    </Label>
                                    <div
                                        className="border-2 border-dashed border-[#D0D5DD] rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-[#F9FAFB] group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden"
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
                                                        Drag & Drop your files
                                                        or{" "}
                                                        <span className="text-primary font-bold">
                                                            Browse
                                                        </span>
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

                            <TabsContent
                                value="seo"
                                className="p-8 h-64 flex items-center justify-center text-[#667085] focus-visible:ring-0"
                            >
                                SEO optimization tools will appear here.
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-[#EAECF0]">
                            <h4 className="font-bold text-[#101828]">
                                Basic Information
                            </h4>
                        </div>
                        <div className="p-8 space-y-6">
                            {/* Author Select */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">
                                    Author
                                </Label>
                                <div className="h-12 border border-[#D0D5DD] rounded-md px-3 flex items-center gap-2 bg-[#F9FAFB]">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage
                                            src={
                                                (mounted &&
                                                    user?.profile?.avatar) ||
                                                ""
                                            }
                                        />
                                        <AvatarFallback>
                                            {name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-[#101828]">
                                        {name}
                                    </span>
                                </div>
                            </div>

                            {/* Post Date & Time */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">
                                    Post Date
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Input
                                            defaultValue="02-10-2026"
                                            className="pl-10 h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                    <div className="relative">
                                        <Input
                                            defaultValue="16:00"
                                            className="pl-10 h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20"
                                        />
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                </div>
                            </div>

                            {/* Category Select */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">
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

                            {/* Country Select */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">
                                    Country (Optional)
                                </Label>
                                <Select
                                    value={countryId}
                                    onValueChange={setCountryId}
                                >
                                    <SelectTrigger className="h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {countries.map((c) => (
                                            <SelectItem
                                                key={c.id}
                                                value={c.id.toString()}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tags Input */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">
                                    Tag
                                </Label>
                                <div className="min-h-12 p-2 bg-white border border-[#D0D5DD] rounded-xl flex flex-wrap gap-2 items-center">
                                    <Badge
                                        variant="outline"
                                        className="bg-[#F9FAFB] border-[#EAECF0] hover:bg-white text-[#344054] px-2 py-1 flex items-center gap-1"
                                    >
                                        Vaccination{" "}
                                        <X className="h-3 w-3 cursor-pointer" />
                                    </Badge>
                                    <Plus className="h-4 w-4 text-[#667085] cursor-pointer ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
