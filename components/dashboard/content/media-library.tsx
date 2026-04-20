"use client";

import * as React from "react";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Search, 
    Plus, 
    Image as ImageIcon, 
    Video, 
    MoreVertical, 
    Trash2, 
    ExternalLink, 
    Copy,
    Filter
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaService, type Media } from "@/services/media";
import { MediaUploadModal } from "@/components/dashboard/media/media-upload-modal";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MediaLibrary() {
    const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeFilter, setActiveFilter] = React.useState<"all" | "image" | "video">("all");
    const queryClient = useQueryClient();

    const { data: mediaRes, isLoading } = useQuery({
        queryKey: ["media"],
        queryFn: () => mediaService.getMedia(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => mediaService.deleteMedia(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["media"] });
            toast.success("Media deleted successfully");
        },
    });

    const mediaList = mediaRes?.data || [];

    const filteredMedia = mediaList.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "all" || item.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    };

    return (
        <>
            <MediaUploadModal 
                isOpen={isUploadModalOpen} 
                onOpenChange={setIsUploadModalOpen} 
            />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-[#101828]">Media Library</h3>
                        <p className="text-sm text-[#475467]">Manage your images, videos, and other media assets.</p>
                    </div>
                    <Button 
                        className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2 h-11 transition-all shadow-sm"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" /> Upload Media
                    </Button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-[#EAECF0]">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                        <Input
                            placeholder="Search media by title..."
                            className="pl-10 h-10 border-[#EAECF0] bg-[#F9FAFB]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 p-1 bg-[#F9FAFB] border border-[#EAECF0] rounded-lg w-full md:w-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-4 text-xs font-medium rounded-md transition-all",
                                activeFilter === "all" ? "bg-white text-primary shadow-sm" : "text-[#667085]"
                            )}
                            onClick={() => setActiveFilter("all")}
                        >
                            All Assets
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-4 text-xs font-medium rounded-md transition-all",
                                activeFilter === "image" ? "bg-white text-primary shadow-sm" : "text-[#667085]"
                            )}
                            onClick={() => setActiveFilter("image")}
                        >
                            Images
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-4 text-xs font-medium rounded-md transition-all",
                                activeFilter === "video" ? "bg-white text-primary shadow-sm" : "text-[#667085]"
                            )}
                            onClick={() => setActiveFilter("video")}
                        >
                            Videos
                        </Button>
                    </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden">
                                <Skeleton className="aspect-video w-full" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : filteredMedia.length > 0 ? (
                        filteredMedia.map((media) => (
                            <div 
                                key={media.id} 
                                className="group bg-white rounded-2xl border border-[#EAECF0] overflow-hidden hover:border-primary/50 hover:shadow-md transition-all flex flex-col"
                            >
                                <div className="relative aspect-video bg-[#F9FAFB] flex items-center justify-center overflow-hidden border-b border-[#EAECF0]">
                                    {media.type === "image" ? (
                                        <img 
                                            src={media.url} 
                                            alt={media.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                                            <Video className="h-10 w-10 text-[#667085]" />
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#667085]">Video Asset</span>
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm bg-white hover:bg-[#F9FAFB]">
                                                    <MoreVertical className="h-4 w-4 text-[#101828]" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[180px]">
                                                <DropdownMenuItem className="gap-2" onClick={() => copyToClipboard(media.url)}>
                                                    <Copy className="h-4 w-4" /> Copy Link
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2" onClick={() => window.open(media.url, '_blank')}>
                                                    <ExternalLink className="h-4 w-4" /> View Original
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50" 
                                                    onClick={() => deleteMutation.mutate(media.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" /> Delete Asset
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    
                                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm shadow-sm border border-[#EAECF0] flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                        {media.type === "image" ? <ImageIcon className="h-3 w-3 text-blue-600" /> : <Video className="h-3 w-3 text-red-600" />}
                                        <span className="text-[10px] font-bold text-[#344054] capitalize">{media.type}</span>
                                    </div>
                                </div>
                                
                                <div className="p-4 flex-1">
                                    <h3 className="font-semibold text-sm text-[#101828] truncate mb-1" title={media.title}>
                                        {media.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-auto">
                                        <p className="text-[11px] text-[#667085]">
                                            {format(new Date(media.created_at), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#EAECF0] rounded-3xl bg-[#F9FAFB]">
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                                <Search className="h-8 w-8 text-[#D0D5DD]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#101828]">No assets found</h3>
                            <p className="text-sm text-[#475467] max-w-[280px] text-center mt-1">
                                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Your media library is empty. Upload your first asset to get started."}
                            </p>
                            {!searchQuery && (
                                <Button 
                                    variant="outline" 
                                    className="mt-6 gap-2 border-[#EAECF0]"
                                    onClick={() => setIsUploadModalOpen(true)}
                                >
                                    <Plus className="h-4 w-4" /> Upload Media
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
