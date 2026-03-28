"use client"

import * as React from "react"
import Link from "next/link"
import DashboardLayout from "@/layout/dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    Image as ImageIcon,
    Calendar,
    Clock,
    UploadCloud
} from "lucide-react"

export default function CreateBlogPostPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                {/* Header / Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/dashboard/content" className="text-[#667085] hover:text-primary transition-colors">
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">Create New Post</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-10 border-[#EAECF0] text-[#344054] font-semibold flex items-center gap-2 px-6">
                            <Eye className="h-4 w-4" /> Preview
                        </Button>
                        <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-semibold px-8">
                            Publish
                        </Button>
                        <button className="text-sm font-semibold text-red-600 hover:text-red-700 ml-2">
                             Delete
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
                    
                    {/* Left Column - Main Editor */}
                    <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                        <Tabs defaultValue="content" className="w-full">
                            <div className="px-8 pt-6 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828] mb-6">Blog Post Page</h4>
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

                            <TabsContent value="content" className="p-8 space-y-8 focus-visible:ring-0">
                                {/* Title Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">Title</Label>
                                    <Input 
                                        placeholder="Enter blog post title"
                                        className="h-14 bg-white border-[#D0D5DD] text-lg font-medium shadow-none focus-visible:ring-primary/20 placeholder:text-[#98A2B3]"
                                        defaultValue="The strength of a people. The power of community."
                                    />
                                </div>

                                {/* Text Editor (Placeholder) */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">Text</Label>
                                    <div className="border border-[#D0D5DD] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                        {/* Toolbar */}
                                        <div className="bg-[#F9FAFB] border-b border-[#D0D5DD] p-2 flex items-center gap-1">
                                            <EditorButton icon={<Bold className="h-4 w-4" />} />
                                            <EditorButton icon={<Italic className="h-4 w-4" />} />
                                            <div className="w-px h-6 bg-[#D0D5DD] mx-1" />
                                            <EditorButton icon={<AlignLeft className="h-4 w-4" />} />
                                            <EditorButton icon={<AlignCenter className="h-4 w-4" />} />
                                            <div className="w-px h-6 bg-[#D0D5DD] mx-1" />
                                            <EditorButton icon={<List className="h-4 w-4" />} />
                                            <EditorButton icon={<LinkIcon className="h-4 w-4" />} />
                                            <EditorButton icon={<Quote className="h-4 w-4" />} />
                                        </div>
                                        {/* Editing Area */}
                                        <Textarea 
                                            className="min-h-[300px] border-none shadow-none focus-visible:ring-0 rounded-none p-6 text-[#475467] leading-relaxed resize-none"
                                            placeholder="Start writing your story..."
                                            defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. |"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload (Placeholder) */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-[#344054]">Upload Image</Label>
                                    <div className="border-2 border-dashed border-[#D0D5DD] rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-[#F9FAFB] group hover:border-primary/50 transition-colors cursor-pointer">
                                        <div className="h-12 w-12 rounded-full bg-white border border-[#EAECF0] shadow-sm flex items-center justify-center text-[#667085] group-hover:text-primary transition-colors">
                                            <UploadCloud className="h-6 w-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-[#475467]">
                                                Drag & Drop your files or <span className="text-primary font-bold">Browse</span>
                                            </p>
                                            <p className="text-xs text-[#667085] mt-1">Max. File Size: 10MB</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="seo" className="p-8 h-64 flex items-center justify-center text-[#667085] focus-visible:ring-0">
                                SEO optimization tools will appear here.
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-[#EAECF0]">
                            <h4 className="font-bold text-[#101828]">Basic Information</h4>
                        </div>
                        <div className="p-8 space-y-6">
                            {/* Author Select */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">Author</Label>
                                <Select defaultValue="jerome">
                                    <SelectTrigger className="h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>JB</AvatarFallback>
                                            </Avatar>
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jerome">Jerome Bell</SelectItem>
                                        <SelectItem value="floyd">Floyd Miles</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Post Date & Time */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">Post Date</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Input defaultValue="02-10-2026" className="pl-10 h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20" />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                    <div className="relative">
                                        <Input defaultValue="16:00" className="pl-10 h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20" />
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                                    </div>
                                </div>
                            </div>

                            {/* Category Select */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">Category</Label>
                                <Select defaultValue="finance">
                                    <SelectTrigger className="h-12 border-[#D0D5DD] shadow-none focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="fintech">Fintech</SelectItem>
                                        <SelectItem value="ngo">NGO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tags Input */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-[#344054] uppercase tracking-wider">Tag</Label>
                                <div className="min-h-12 p-2 bg-white border border-[#D0D5DD] rounded-xl flex flex-wrap gap-2 items-center">
                                    <Badge variant="outline" className="bg-[#F9FAFB] border-[#EAECF0] hover:bg-white text-[#344054] px-2 py-1 flex items-center gap-1">
                                        Vaccination <X className="h-3 w-3 cursor-pointer" />
                                    </Badge>
                                    <Plus className="h-4 w-4 text-[#667085] cursor-pointer ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}

function EditorButton({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
    return (
        <button className={cn(
            "p-2 rounded-lg hover:bg-[#EAECF0] transition-colors text-[#667085]",
            active && "bg-[#EAECF0] text-primary"
        )}>
            {icon}
        </button>
    )
}
