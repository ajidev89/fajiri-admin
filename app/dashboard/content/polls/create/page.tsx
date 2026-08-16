"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/layout/dashboard";
import { ChevronRight } from "lucide-react";
import { PollForm, type PollFormValues } from "@/components/dashboard/content/polls/poll-form";
import { useMutation } from "@tanstack/react-query";
import { pollService, type CreatePollPayload } from "@/services/polls";
import { toast } from "sonner";

export default function CreatePollPage() {
    const router = useRouter();

    const createMutation = useMutation({
        mutationFn: (payload: CreatePollPayload) => pollService.createPoll(payload),
        onSuccess: () => {
            toast.success("Poll published successfully");
            router.push("/dashboard/content/polls");
        },
        onError: (error: any) => toast.error(error?.message || "Failed to create poll"),
    });

    const handleSubmit = async (data: PollFormValues, status: "draft" | "active") => {
        // Combine date + time into ISO datetime
        const startDateTime = `${data.start_date}T${data.start_time}:00`;

        const payload: CreatePollPayload = {
            title: data.title,
            type: data.type,
            status,
            start_date: startDateTime,
            duration_hours: data.duration_hours,
            options: data.options?.map((o, i) => ({ label: o.label, order: i })),
        };

        createMutation.mutate(payload);
    };

    return (
        <DashboardLayout>
            {/* Breadcrumb + Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link
                        href="/dashboard/content/polls"
                        className="hover:text-gray-800 transition-colors"
                    >
                        Back
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">Create New Poll</span>
                </div>
            </div>

            <PollForm
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
            />
        </DashboardLayout>
    );
}
