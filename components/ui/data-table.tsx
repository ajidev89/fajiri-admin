"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "./table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    ChevronLeft, 
    ChevronRight, 
    Search,
    Filter,
    ArrowUpDown,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    title?: string;
    isLoading?: boolean;
    page?: number;
    pageCount?: number;
    onPageChange?: (page: number) => void;
    total?: number;
}

function visiblePages(current: number, total: number, max = 5) {
    if (total <= 0) return [1];
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    const end = Math.min(total, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    title,
    isLoading,
    page,
    pageCount,
    onPageChange,
    total,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isServerPaginated = typeof onPageChange === "function" && page != null;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        ...(isServerPaginated ? {} : { getPaginationRowModel: getPaginationRowModel() }),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const currentPage = isServerPaginated
        ? page
        : table.getState().pagination.pageIndex + 1;
    const totalPages = isServerPaginated
        ? Math.max(pageCount ?? 1, 1)
        : Math.max(table.getPageCount(), 1);
    const canPrevious = isServerPaginated ? currentPage > 1 : table.getCanPreviousPage();
    const canNext = isServerPaginated ? currentPage < totalPages : table.getCanNextPage();
    const goToPage = (nextPage: number) => {
        if (isServerPaginated) {
            onPageChange(nextPage);
            return;
        }
        table.setPageIndex(nextPage - 1);
    };

    if (!isMounted) {
        return <div className="bg-white rounded-2xl border border-[#EAECF0] h-96 animate-pulse" />;
    }

    return (
        <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-sm overflow-hidden">
            {/* Table Header/Toolbar */}
            <div className="p-4 sm:p-6 border-b border-[#EAECF0] flex flex-col md:flex-row md:items-center justify-between gap-4">
                {title && <h2 className="text-base sm:text-lg font-bold text-[#101828]">{title}</h2>}
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {(searchKey || onSearchChange) && (
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={
                                    onSearchChange
                                        ? (searchValue ?? "")
                                        : ((table.getColumn(searchKey!)?.getFilterValue() as string) ?? "")
                                }
                                onChange={(event) => {
                                    if (onSearchChange) {
                                        onSearchChange(event.target.value);
                                        return;
                                    }
                                    table.getColumn(searchKey!)?.setFilterValue(event.target.value);
                                }}
                                className="pl-10 h-10 bg-[#F9FAFB] border-[#EAECF0] text-sm"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="h-10 flex-1 sm:flex-none border-[#EAECF0] text-[#344054] font-medium gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 flex-1 sm:flex-none border-[#EAECF0] text-[#344054] font-medium gap-2 hidden sm:flex">
                                    <ArrowUpDown className="h-4 w-4" /> Sort by
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px] bg-white">
                                <DropdownMenuItem onClick={() => setSorting([{ id: searchKey || "id", desc: false }])} className="cursor-pointer">
                                    Ascending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSorting([{ id: searchKey || "id", desc: true }])} className="cursor-pointer">
                                    Descending
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <Table className="min-w-max w-full">
                <TableHeader className="bg-[#F9FAFB]">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="text-xs font-semibold text-[#475467] py-3 sm:py-4 h-auto uppercase tracking-wider whitespace-nowrap">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Loading...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="hover:bg-[#F9FAFB] border-[#EAECF0]"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-3 sm:py-4 px-3 sm:px-4 text-sm text-[#101828] whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-[#667085]">
                                No results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Table Pagination */}
            <div className="p-4 border-t border-[#EAECF0] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-sm text-[#475467] order-2 sm:order-1">
                   <span className="font-medium text-[#101828]">Page {currentPage}</span> of{" "}
                   <span className="font-medium text-[#101828]">{totalPages}</span>
                   {typeof total === "number" && (
                       <span className="ml-2">
                           · {total} {total === 1 ? "result" : "results"}
                       </span>
                   )}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={!canPrevious}
                        className="text-[#344054] hover:bg-[#F9FAFB] h-10 px-3"
                    >
                        <ChevronLeft className="h-4 w-4 sm:mr-2" /> 
                        <span className="hidden sm:inline">Previous</span>
                    </Button>
                    
                    {/* Page Numbers - Shown only on larger screens */}
                    <div className="hidden md:flex items-center gap-1 mx-2">
                        {visiblePages(currentPage, totalPages).map((pageNumber) => (
                            <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "ghost"}
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-lg text-xs font-semibold",
                                    currentPage === pageNumber 
                                        ? "bg-[#0E3B5D] text-white hover:bg-[#0E3B5D]/90" 
                                        : "text-[#475467] hover:bg-[#F9FAFB]"
                                )}
                                onClick={() => goToPage(pageNumber)}
                            >
                                {pageNumber}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={!canNext}
                        className="text-[#344054] hover:bg-[#F9FAFB] h-10 px-3"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4 sm:ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Sub-components for shadcn table structure (if not yet exists)
// We'll create these as standalone UI components if needed, or inline them.
// Since I don't see table.tsx in components/ui, I'll provide a basic implementation below or create it.
