"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define the shape of our data
type BlogPost = {
    id: string;
    title: string;
    category: "Fintech" | "Finance" | "NGO";
    publishedDate: string;
    lastUpdated: string;
    author: {
        name: string;
        avatar: string;
    };
    status: "Published" | "Scheduled" | "Draft";
};

// Mock data
const posts: BlogPost[] = [
    {
        id: "1",
        title: "Top 10 emerging Tech Trends to watch in 2026",
        category: "Fintech",
        publishedDate: "24-2-2026",
        lastUpdated: "24-2-2026",
        author: {
            name: "Jerome Bell",
            avatar: "https://github.com/shadcn.png"
        },
        status: "Published",
    },
    {
        id: "2",
        title: "Top 10 emerging Tech Trends to watch in 2026",
        category: "Finance",
        publishedDate: "24-2-2026",
        lastUpdated: "24-2-2026",
        author: {
            name: "Jerome Bell",
            avatar: "https://github.com/shadcn.png"
        },
        status: "Scheduled",
    },
    {
        id: "3",
        title: "Top 10 emerging Tech Trends to watch in 2026",
        category: "NGO",
        publishedDate: "24-2-2026",
        lastUpdated: "24-2-2026",
        author: {
            name: "Jerome Bell",
            avatar: "https://github.com/shadcn.png"
        },
        status: "Draft",
    },
    {
        id: "4",
        title: "Top 10 emerging Tech Trends to watch in 2026",
        category: "Fintech",
        publishedDate: "24-2-2026",
        lastUpdated: "24-2-2026",
        author: {
            name: "Jerome Bell",
            avatar: "https://github.com/shadcn.png"
        },
        status: "Published",
    },
    {
        id: "5",
        title: "Top 10 emerging Tech Trends to watch in 2026",
        category: "Fintech",
        publishedDate: "24-2-2026",
        lastUpdated: "24-2-2026",
        author: {
            name: "Jerome Bell",
            avatar: "https://github.com/shadcn.png"
        },
        status: "Published",
    },
    {
        id: "6",
        title: "Top 10 emerging Tech Trends to watch in 2026",
        category: "Fintech",
        publishedDate: "24-2-2026",
        lastUpdated: "24-2-2026",
        author: {
            name: "Jerome Bell",
            avatar: "https://github.com/shadcn.png"
        },
        status: "Published",
    },
];

// Columns definition with checkboxes
const columns: ColumnDef<BlogPost>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return (
                <div className="max-w-[300px] font-medium text-[#101828] truncate">
                    {row.getValue("title")}
                </div>
            )
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.getValue("category") as string;
            return (
                <span className={cn(
                    "font-semibold text-xs",
                    category === "Fintech" && "text-[#475467]",
                    category === "Finance" && "text-[#101828]",
                    category === "NGO" && "text-[#6941C6]"
                )}>
                    {category}
                </span>
            );
        },
    },
    {
        accessorKey: "publishedDate",
        header: "Published Date",
    },
    {
        accessorKey: "lastUpdated",
        header: "Last Updated",
    },
    {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => {
            const author = row.original.author;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={author.avatar} />
                        <AvatarFallback>BT</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-[#101828]">{author.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={
                    status === "Published" ? "success" : 
                    status === "Scheduled" ? "warning" : "default"
                }>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#667085]">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Post</DropdownMenuItem>
                    <DropdownMenuItem>View on Site</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function ContentManagementPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">Content Management</h2>
                        <p className="text-sm text-[#475467]">Control and organize platform content.</p>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="blog" className="w-full">
                    <TabsList className="h-auto bg-transparent p-0 gap-8 justify-start border-b border-[#EAECF0] w-full rounded-none">
                        <TabsTrigger 
                            value="blog" 
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Blog Posts
                        </TabsTrigger>
                        <TabsTrigger 
                            value="news" 
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            News
                        </TabsTrigger>
                        <TabsTrigger 
                            value="testimonial" 
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Testimonial
                        </TabsTrigger>
                        <TabsTrigger 
                            value="faq" 
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            FAQs
                        </TabsTrigger>
                        <TabsTrigger 
                            value="events" 
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Events
                        </TabsTrigger>
                        <TabsTrigger 
                            value="media" 
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Media
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="blog" className="mt-8 space-y-6 focus-visible:ring-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-[#101828]">Blog Posts</h3>
                            <Button asChild className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2">
                                <Link href="/dashboard/content/create">
                                    <Plus className="h-4 w-4" /> New Post
                                </Link>
                            </Button>
                        </div>
                        
                        <DataTable 
                            columns={columns} 
                            data={posts} 
                            searchKey="title" 
                            title="Blog Posts Table" 
                        />
                    </TabsContent>

                    <TabsContent value="news" className="mt-8 h-64 flex items-center justify-center text-[#667085] focus-visible:ring-0">
                        No news articles available.
                    </TabsContent>

                    <TabsContent value="testimonial" className="mt-8 h-64 flex items-center justify-center text-[#667085] focus-visible:ring-0">
                        No testimonials recorded.
                    </TabsContent>

                    <TabsContent value="faq" className="mt-8 h-64 flex items-center justify-center text-[#667085] focus-visible:ring-0">
                        No FAQs available.
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
