"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { pollService } from "@/services/polls";
import { PollStats } from "@/components/dashboard/content/polls/poll-stats";
import { PollResults } from "@/components/dashboard/content/polls/poll-results";
import { PollRecentResponses } from "@/components/dashboard/content/polls/poll-recent-responses";

export default function PollSummaryPage() {
    const params = useParams();
    const router = useRouter();
    const pollId = Number(params.id);

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-poll-summary", pollId],
        queryFn: () => pollService.getPollSummary(pollId),
        enabled: !!pollId && !isNaN(pollId),
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Loading summary...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !data?.data) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-red-500">Failed to load poll summary.</p>
                    <Button variant="outline" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const summary = data.data;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.push("/dashboard/content/polls")}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {summary.poll.title}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Poll Summary
                        </p>
                    </div>
                </div>

                <PollStats
                    totalVotes={summary.stats.total_votes}
                    totalViews={summary.stats.total_views}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PollResults
                        title="Poll Results"
                        options={summary.options}
                    />
                    <PollRecentResponses
                        responses={summary.recent_responses}
                        onSeeMore={() => {
                            // Can be extended to show all responses later
                            router.push(`/dashboard/content/polls`);
                        }}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
