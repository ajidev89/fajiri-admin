"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/layout/dashboard";
import { ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PollForm, type PollFormValues } from "@/components/dashboard/content/polls/poll-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pollService, type UpdatePollPayload } from "@/services/polls";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EditPollPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const pollId = Number(id);

    const { data, isLoading } = useQuery({
        queryKey: ["poll", pollId],
        queryFn: () => pollService.getPoll(pollId),
        enabled: !!pollId,
    });

    const updateMutation = useMutation({
        mutationFn: (payload: UpdatePollPayload) =>
            pollService.updatePoll(pollId, payload),
        onSuccess: () => {
            toast.success("Poll updated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-polls"] });
            router.push("/dashboard/content/polls");
        },
        onError: () => toast.error("Failed to update poll"),
    });

    const deleteMutation = useMutation({
        mutationFn: () => pollService.deletePoll(pollId),
        onSuccess: () => {
            toast.success("Poll deleted");
            queryClient.invalidateQueries({ queryKey: ["admin-polls"] });
            router.push("/dashboard/content/polls");
        },
        onError: () => toast.error("Failed to delete poll"),
    });

    const poll = data?.data;

    const handleSubmit = async (data: PollFormValues, status: "draft" | "active") => {
        const startDateTime = `${data.start_date}T${data.start_time}:00`;
        const payload: UpdatePollPayload = {
            title: data.title,
            type: data.type,
            status,
            start_date: startDateTime,
            duration_hours: data.duration_hours,
            options: data.options?.map((o, i) => ({ label: o.label, order: i })),
        };
        await updateMutation.mutateAsync(payload);
    };

    // Build defaultValues from existing poll
    const defaultValues: Partial<PollFormValues> | undefined = poll
        ? {
              title: poll.title,
              type: poll.type,
              start_date: format(new Date(poll.start_date), "yyyy-MM-dd"),
              start_time: format(new Date(poll.start_date), "HH:mm"),
              duration_hours: poll.duration_hours,
              options: poll.options.map((o) => ({ label: o.label })),
          }
        : undefined;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
            </DashboardLayout>
        );
    }

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
                    <span className="text-gray-900 font-medium">Edit Poll</span>
                </div>
                <Button
                    id="delete-poll-btn"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                </Button>
            </div>

            {poll && (
                <PollForm
                    existingPoll={poll}
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isLoading={updateMutation.isPending}
                />
            )}
        </DashboardLayout>
    );
}
