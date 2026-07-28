"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { PollResponse } from "@/services/polls";

interface PollRecentResponsesProps {
    responses: PollResponse[];
    onSeeMore?: () => void;
}

export function PollRecentResponses({
    responses,
    onSeeMore,
}: PollRecentResponsesProps) {
    return (
        <div>
            <p className="text-base font-semibold text-gray-900 mb-3">
                Recent Responses
            </p>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {responses.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No responses yet.
                    </p>
                ) : (
                    <div>
                        {responses.map((response) => (
                            <div
                                key={response.id}
                                className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 last:border-b-0"
                            >
                                <Avatar className="w-9 h-9 flex-shrink-0">
                                    <AvatarImage src={response.user?.avatar ?? undefined} />
                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                        {response.user?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {response.user?.name ?? "Unknown user"}{" "}
                                        {response.user?.member_id && (
                                            <span className="font-normal text-gray-500">
                                                #{response.user.member_id}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Answered this question {response.answered_at}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {onSeeMore && (
                            <div className="p-4">
                                <Button
                                    variant="outline"
                                    className="w-full bg-[#1C274C] text-white border-none hover:bg-[#1C274C]/90"
                                    onClick={onSeeMore}
                                >
                                    See more responses
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
