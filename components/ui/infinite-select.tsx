"use client";

import type * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useFormContext, useController } from "react-hook-form";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface Option {
    name: string;
    value: string;
    icon?: React.ReactNode;
    data?: any;
}

interface InfiniteSelectProps {
    name?: string; // optional when not using RHF
    label?: string | React.ReactNode;
    className?: string;
    placeholder: string;
    validation?: any;
    options: Option[];
    lastPage?: number;
    loading?: boolean;
    isSearching?: boolean;
    onSearch?: (value: string) => void;
    onChange?: (value: string) => void;
    onChangePage?: (page: number) => void;
    value?: string | null;
    useFormContext?: boolean;
    disabled?: boolean;
    renderOption?: (option: Option) => React.ReactNode;
    footer?: React.ReactNode;
}

function useSafeFormContext() {
    try {
        return useFormContext();
    } catch {
        return null;
    }
}

const InfiniteSelect: React.FC<InfiniteSelectProps> = ({
    name,
    label,
    className,
    placeholder,
    validation,
    options,
    lastPage = 1,
    loading = false,
    onSearch,
    onChange,
    onChangePage,
    isSearching = false,
    value,
    useFormContext = true,
    disabled = false,
    renderOption,
    footer,
}) => {
    const form = useSafeFormContext();
    
    // We use local state for the value if RHF is not used
    const [localValue, setLocalValue] = useState<string>(value || "");

    // We only call useController if name is provided and we are in a form context
    // Actually, hooks must be called unconditionally. 
    // We can use a "dummy" name if needed, but RHF usually requires a valid name.
    const { field } = useController({
        name: name || "unnamed-select",
        control: form?.control,
        defaultValue: value || "",
        disabled: disabled,
    });

    const errors = form?.formState?.errors;
    const fieldError = name ? errors?.[name] : null;

    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);

    // Sync field value with local state if needed
    const currentValue = name && form ? field.value : (value || localValue);

    /* ---------------- Init value ---------------- */
    useEffect(() => {
        if (!currentValue) {
            setSelectedOption(null);
            return;
        }

        const option = options.find(
            (item) => item.value === String(currentValue),
        );

        if (option) setSelectedOption(option);
    }, [options, currentValue]);

    /* ---------------- Reset page on open ---------------- */
    useEffect(() => {
        if (open) setPage(1);
    }, [open]);

    /* ---------------- Debounced search ---------------- */
    const debounce = <T extends (...args: any[]) => void>(
        fn: T,
        delay: number,
    ) => {
        let timeout: any;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    };

    const handleSearch = useCallback(
        debounce((val: string) => {
            setPage(1);
            onSearch?.(val);
        }, 500),
        [onSearch],
    );

    /* ---------------- Select option ---------------- */
    const handleSelect = (option: Option) => {
        setSelectedOption(option);
        onChange?.(option.value);
        
        if (name && form) {
            field.onChange(option.value);
        } else {
            setLocalValue(option.value);
        }
        
        setOpen(false);
    };

    /* ---------------- Load more ---------------- */
    const handleLoadMore = () => {
        if (page < lastPage && !loading && onChangePage) {
            const next = page + 1;
            setPage(next);
            onChangePage(next);
        }
    };

    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-sm font-medium text-[#344054] mb-1">
                    {label}
                </label>
            )}

            <Popover
                open={open}
                onOpenChange={(open) => !disabled && setOpen(open)}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            "w-full h-[40px] justify-between font-normal",
                            fieldError ? "border-red-500" : "",
                            disabled
                                ? "bg-gray-100! cursor-not-allowed opacity-50"
                                : "",
                            className,
                        )}
                    >
                        {selectedOption ? (
                            <span className="flex items-center gap-2">
                                {selectedOption.icon}
                                {selectedOption.name}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">
                                {placeholder}
                            </span>
                        )}

                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-(--radix-popover-trigger-width) bg-white p-0 !z-[999999]"
                    align="start"
                >
                    <Command shouldFilter={!onSearch}>
                        <CommandInput
                            placeholder="Search..."
                            onValueChange={handleSearch}
                            className="!py-6"
                        />

                        <CommandList className="max-h-[240px]">
                            {!isSearching && (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}

                            <CommandGroup className="p-2">
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => handleSelect(option)}
                                    >
                                        {renderOption ? (
                                            renderOption(option)
                                        ) : (
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {option.icon}
                                                    {option.name}
                                                </div>

                                                {selectedOption?.value ===
                                                    option.value && (
                                                    <Check className="h-4 w-4 shrink-0" />
                                                )}
                                            </div>
                                        )}
                                    </CommandItem>
                                ))}

                                {!isSearching && page < lastPage && (
                                    <div className="px-1 py-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-dashed"
                                            onClick={handleLoadMore}
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Loading..."
                                                : "Show More"}
                                        </Button>
                                    </div>
                                )}

                                {loading && options.length === 0 && (
                                    <div className="flex justify-center py-4 text-sm text-muted-foreground">
                                        Loading...
                                    </div>
                                )}
                            </CommandGroup>
                        </CommandList>

                        <CommandSeparator />

                        {footer && (
                            <CommandGroup>
                                <CommandItem>{footer}</CommandItem>
                            </CommandGroup>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>

            {fieldError?.message && (
                <p className="text-red-500 text-xs font-medium mt-1">
                    {String(fieldError.message)}
                </p>
            )}
        </div>
    );
};

export default InfiniteSelect;
