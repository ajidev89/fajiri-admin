"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
}

interface PollOptionsEditorProps {
    value: Option[];
    onChange: (options: Option[]) => void;
    pollType: string;
}

export function PollOptionsEditor({
    value,
    onChange,
    pollType,
}: PollOptionsEditorProps) {
    const isOptionBased = pollType === "radio" || pollType === "checkbox";

    if (!isOptionBased) return null;

    const addOption = () => {
        onChange([...value, { label: "" }]);
    };

    const removeOption = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const updateOption = (index: number, label: string) => {
        const updated = [...value];
        updated[index] = { label };
        onChange(updated);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Options</p>
            {value.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                    {/* Radio/Checkbox indicator */}
                    <div
                        className={cn(
                            "flex-shrink-0 w-4 h-4 border-2 border-gray-300",
                            pollType === "radio" ? "rounded-full" : "rounded"
                        )}
                    />
                    <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                    />
                    <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove option"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 pl-0"
            >
                <Plus size={16} className="mr-1" />
                Add Option
            </Button>
        </div>
    );
}
