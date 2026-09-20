"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BlogPost } from "@/services";

export interface BlogPreviewData {
    title: string;
    content: string;
    image?: string | null;
    authorName?: string;
    authorAvatar?: string | null;
    publishedAt?: string | null;
    categoryName?: string;
    tags?: string[];
}

interface BlogPreviewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    post: BlogPreviewData | null;
}

function formatPreviewDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, "MMMM d, yyyy");
}

function isEmptyHtml(html?: string) {
    return !html?.replace(/<[^>]*>/g, "").trim();
}

export function blogPostToPreview(post: BlogPost): BlogPreviewData {
    const profile = post.author?.profile;
    const authorName = profile
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : post.author?.username;

    return {
        title: post.title,
        content: post.content,
        image: post.image,
        authorName: authorName || undefined,
        authorAvatar: profile?.avatar,
        publishedAt: post.published_at,
        categoryName: post.category?.name,
        tags: post.tags,
    };
}

export function BlogPreviewModal({
    isOpen,
    onOpenChange,
    post,
}: BlogPreviewModalProps) {
    const publishedDate = formatPreviewDate(post?.publishedAt);
    const authorName = post?.authorName || "Admin";
    const hasContent = !isEmptyHtml(post?.content);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 bg-white border-0 shadow-lg rounded-2xl overflow-hidden gap-0 grid-rows-[auto_1fr]">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        Blog Preview
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    {post?.image && (
                        <img
                            src={post.image}
                            alt={post.title || "Blog cover"}
                            className="w-full h-56 object-cover"
                        />
                    )}

                    <article className="p-6 sm:p-8 space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            {post?.categoryName && (
                                <Badge
                                    variant="outline"
                                    className="bg-[#F0F5F9] text-primary border-[#EAECF0]"
                                >
                                    {post.categoryName}
                                </Badge>
                            )}
                            {post?.tags?.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="bg-[#F9FAFB] text-[#344054] border-[#EAECF0]"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <h2 className="text-3xl font-bold text-[#101828] leading-tight">
                            {post?.title?.trim() || "Untitled post"}
                        </h2>

                        <div className="flex items-center gap-3 text-sm text-[#667085]">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={post?.authorAvatar || ""} />
                                <AvatarFallback>
                                    {authorName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-[#101828]">
                                    {authorName}
                                </p>
                                {publishedDate && (
                                    <p className="text-xs">{publishedDate}</p>
                                )}
                            </div>
                        </div>

                        {hasContent ? (
                            <div
                                className="text-[#475467] text-[15px] leading-relaxed [&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#101828] [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#101828] [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#101828] [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#D0D5DD] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#667085] [&_blockquote]:mb-4 [&_strong]:font-semibold [&_strong]:text-[#101828] [&_img]:rounded-xl [&_img]:my-4"
                                dangerouslySetInnerHTML={{
                                    __html: post?.content || "",
                                }}
                            />
                        ) : (
                            <p className="text-sm italic text-[#667085]">
                                No content yet. Add text in the editor to see it
                                here.
                            </p>
                        )}
                    </article>
                </div>
            </DialogContent>
        </Dialog>
    );
}
