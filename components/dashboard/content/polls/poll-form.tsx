"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PollOptionsEditor } from "./poll-options-editor";
import type { Poll, PollType } from "@/services/polls";

// ─── Schema ───────────────────────────────────────────────────────────────────

const pollSchema = z.object({
    title: z.string().min(1, "Poll title is required"),
    type: z.enum(["radio", "checkbox", "short_text", "long_text"] as const),
    start_date: z.string().min(1, "Start date is required"),
    start_time: z.string().min(1, "Start time is required"),
    duration_hours: z.number().min(1, "Duration must be at least 1 hour"),
    options: z
        .array(z.object({ label: z.string().min(1, "Option label is required") }))
        .optional(),
});

export type PollFormValues = z.infer<typeof pollSchema>;

const POLL_TYPES: { label: string; value: PollType }[] = [
    { label: "Radio button", value: "radio" },
    { label: "Check boxes", value: "checkbox" },
    { label: "Short answer text", value: "short_text" },
    { label: "Long answer text", value: "long_text" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PollFormProps {
    defaultValues?: Partial<PollFormValues>;
    existingPoll?: Poll;
    onSubmit: (data: PollFormValues, status: "draft" | "active") => Promise<void>;
    isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PollForm({
    defaultValues,
    existingPoll,
    onSubmit,
    isLoading,
}: PollFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<PollFormValues>({
        resolver: zodResolver(pollSchema),
        defaultValues: defaultValues ?? {
            title: "",
            type: "radio",
            start_date: "",
            start_time: "",
            duration_hours: 24,
            options: [{ label: "" }, { label: "" }],
        },
    });

    const pollType = watch("type");
    const [submitStatus, setSubmitStatus] = React.useState<"draft" | "active">("draft");

    const handleFormSubmit = async (data: PollFormValues) => {
        await onSubmit(data, submitStatus);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Poll Page Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h2 className="text-base font-semibold text-gray-900">Poll Page</h2>

                {/* Title + Type row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="poll-title">Poll Title</Label>
                        <Input
                            id="poll-title"
                            placeholder="Vote for your favorite inspirational movie"
                            {...register("title")}
                            className={errors.title ? "border-red-400" : ""}
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="poll-type">Poll Type</Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger id="poll-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {POLL_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.type && (
                            <p className="text-xs text-red-500">{errors.type.message}</p>
                        )}
                    </div>
                </div>

                {/* Options editor (only for radio/checkbox) */}
                <Controller
                    name="options"
                    control={control}
                    render={({ field }) => (
                        <PollOptionsEditor
                            value={field.value ?? []}
                            onChange={field.onChange}
                            pollType={pollType}
                        />
                    )}
                />

                {/* Date / Time / Duration row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                            id="start-date"
                            type="date"
                            {...register("start_date")}
                            className={errors.start_date ? "border-red-400" : ""}
                        />
                        {errors.start_date && (
                            <p className="text-xs text-red-500">{errors.start_date.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="start-time">Time</Label>
                        <Input
                            id="start-time"
                            type="time"
                            {...register("start_time")}
                            className={errors.start_time ? "border-red-400" : ""}
                        />
                        {errors.start_time && (
                            <p className="text-xs text-red-500">{errors.start_time.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <div className="relative">
                            <Input
                                id="duration"
                                type="number"
                                min={1}
                                {...register("duration_hours", { valueAsNumber: true })}
                                className={errors.duration_hours ? "border-red-400" : ""}
                            />
                        </div>
                        {errors.duration_hours && (
                            <p className="text-xs text-red-500">{errors.duration_hours.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 justify-end">
                <Button
                    type="submit"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => setSubmitStatus("draft")}
                >
                    Save as Draft
                </Button>
                <Button
                    type="submit"
                    className="bg-[#1C274C] hover:bg-[#1C274C]/90 text-white"
                    disabled={isLoading}
                    onClick={() => setSubmitStatus("active")}
                >
                    {isLoading ? "Publishing..." : "Publish"}
                </Button>
            </div>
        </form>
    );
}
