"use client";

import type * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
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

    const register = form?.register;
    const getValues = form?.getValues;
    const setValue = form?.setValue;
    const errors = form?.formState?.errors;

    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);

    /* ---------------- Init value ---------------- */
    useEffect(() => {
        const currentValue = getValues?.(name!) || value;

        if (!currentValue) {
            setSelectedOption(null);
            return;
        }

        const option = options.find(
            (item) => item.value === String(currentValue),
        );

        if (option) setSelectedOption(option);
    }, [options, value, getValues, name]);


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

        if (useFormContext && setValue && name) {
            setValue(name, option.value as any, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
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

    const fieldError = name ? errors?.[name] : null;

    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-sm font-medium text-[#181B25] mb-1">
                    {label}
                </label>
            )}

            {/* Hidden input only for RHF */}
            {useFormContext && register && name && (
                <input
                    type="hidden"
                    {...register(name, validation)}
                    value={selectedOption?.value ?? ""}
                />
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
                    className="w-(--radix-popover-trigger-width) p-0 !z-[999999]"
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
