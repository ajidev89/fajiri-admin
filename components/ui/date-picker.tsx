"use client";

import * as React from "react";
import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const pickerClassName =
    "h-12 rounded-xl border-[#D0D5DD] shadow-none pl-10 pr-3 text-sm text-[#101828] cursor-pointer focus:ring-primary/20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

interface DatePickerProps
    extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
    value: string;
    onChange: (value: string) => void;
}

export function DatePicker({ value, onChange, className, ...props }: DatePickerProps) {
    return (
        <div className={cn("relative", className)}>
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <Input
                type="date"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={pickerClassName}
                {...props}
            />
        </div>
    );
}

interface TimePickerProps
    extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
    value: string;
    onChange: (value: string) => void;
}

export function TimePicker({ value, onChange, className, ...props }: TimePickerProps) {
    return (
        <div className={cn("relative", className)}>
            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <Input
                type="time"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={pickerClassName}
                {...props}
            />
        </div>
    );
}
