"use client";

import * as React from "react";

interface PollResultsProps {
    options: Array<{
        id: number;
        label: string;
        votes_count: number;
        vote_percentage: number;
    }>;
    title: string;
}

export function PollResults({ options, title }: PollResultsProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
            <div className="space-y-4">
                {options.map((option) => (
                    <div key={option.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{option.label}</span>
                            <span className="font-semibold text-[#1C274C]">
                                {option.vote_percentage}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[#1C274C] transition-all duration-500"
                                style={{ width: `${option.vote_percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
