"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Ticket, Users } from "lucide-react";
import type { Event } from "@/services";

export interface EventPreviewData {
    title: string;
    description: string;
    image?: string | null;
    location?: string;
    startDate?: string | null;
    endDate?: string | null;
    categoryName?: string;
    status?: string;
    slots?: number;
    amount?: number | string;
}

interface EventPreviewModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    event: EventPreviewData | null;
}

function formatPreviewDate(value?: string | null, withTime = true) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return format(date, withTime && value.includes("T") ? "MMMM d, yyyy 'at' h:mm a" : "MMMM d, yyyy");
}

function isEmptyHtml(html?: string) {
    return !html?.replace(/<[^>]*>/g, "").trim();
}

function formatPrice(amount?: number | string) {
    const value = Number(amount);
    if (!amount && amount !== 0) return null;
    if (Number.isNaN(value) || value <= 0) return "Free";
    return value.toLocaleString();
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "default" | "error"> = {
    upcoming: "success",
    ongoing: "warning",
    completed: "default",
    cancelled: "error",
};

export function eventToPreview(event: Event): EventPreviewData {
    return {
        title: event.title,
        description: event.description,
        image: event.image,
        location: event.location || undefined,
        startDate: event.start_date,
        endDate: event.end_date,
        categoryName: event.category?.name,
        status: event.status,
        slots: event.slots,
        amount: event.amount,
    };
}

export function EventPreviewModal({
    isOpen,
    onOpenChange,
    event,
}: EventPreviewModalProps) {
    const startDate = formatPreviewDate(event?.startDate);
    const endDate = formatPreviewDate(event?.endDate);
    const hasContent = !isEmptyHtml(event?.description);
    const price = formatPrice(event?.amount);
    const status = event?.status || "upcoming";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 bg-white border-0 shadow-lg rounded-2xl overflow-hidden gap-0 grid-rows-[auto_1fr]">
                <DialogHeader className="p-6 border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        Event Preview
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    {event?.image && (
                        <img
                            src={event.image}
                            alt={event.title || "Event cover"}
                            className="w-full h-56 object-cover"
                        />
                    )}

                    <article className="p-6 sm:p-8 space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={STATUS_VARIANT[status] || "default"}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                            {event?.categoryName && (
                                <Badge
                                    variant="outline"
                                    className="bg-[#F0F5F9] text-primary border-[#EAECF0]"
                                >
                                    {event.categoryName}
                                </Badge>
                            )}
                        </div>

                        <h2 className="text-3xl font-bold text-[#101828] leading-tight">
                            {event?.title?.trim() || "Untitled event"}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start gap-3 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3">
                                <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                                        Starts
                                    </p>
                                    <p className="text-sm font-medium text-[#101828]">
                                        {startDate || "Date not set"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3">
                                <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                                        Ends
                                    </p>
                                    <p className="text-sm font-medium text-[#101828]">
                                        {endDate || "Not specified"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3">
                                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                                        Location
                                    </p>
                                    <p className="text-sm font-medium text-[#101828]">
                                        {event?.location?.trim() || "Virtual"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3">
                                <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                                        Slots
                                    </p>
                                    <p className="text-sm font-medium text-[#101828]">
                                        {event?.slots ? event.slots.toLocaleString() : "Unlimited"}
                                    </p>
                                </div>
                            </div>
                            {price && (
                                <div className="flex items-start gap-3 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3 sm:col-span-2">
                                    <Ticket className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                                            Price
                                        </p>
                                        <p className="text-sm font-medium text-[#101828]">
                                            {price}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {hasContent ? (
                            <div
                                className="text-[#475467] text-[15px] leading-relaxed [&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#101828] [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#101828] [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#101828] [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#D0D5DD] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#667085] [&_blockquote]:mb-4 [&_strong]:font-semibold [&_strong]:text-[#101828] [&_img]:rounded-xl [&_img]:my-4"
                                dangerouslySetInnerHTML={{
                                    __html: event?.description || "",
                                }}
                            />
                        ) : (
                            <p className="text-sm italic text-[#667085]">
                                No description yet. Add details in the editor to
                                see them here.
                            </p>
                        )}
                    </article>
                </div>
            </DialogContent>
        </Dialog>
    );
}
