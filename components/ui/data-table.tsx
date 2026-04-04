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
import { useState } from "react";
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
    title?: string;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    title,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div className="bg-white rounded-2xl border border-[#EAECF0] shadow-sm overflow-hidden auto-cols-auto">
            {/* Table Header/Toolbar */}
            <div className="p-6 border-b border-[#EAECF0] flex flex-col sm:flex-row items-center justify-between gap-4">
                {title && <h2 className="text-lg font-bold text-[#101828]">{title}</h2>}
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {searchKey && (
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                            <Input
                                placeholder={`Search...`}
                                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                }
                                className="pl-10 h-10 bg-[#F9FAFB] border-[#EAECF0] text-sm"
                            />
                        </div>
                    )}
                    <Button variant="outline" className="h-10 border-[#EAECF0] text-[#344054] font-medium gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 border-[#EAECF0] text-[#344054] font-medium gap-2 hidden lg:flex">
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

            {/* Table Content */}
            <div className="overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader className="bg-[#F9FAFB]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-semibold text-[#475467] py-4 h-auto uppercase tracking-wider">
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
                                        <TableCell key={cell.id} className="py-4 text-sm text-[#101828]">
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
            </div>

            {/* Table Pagination */}
            <div className="p-4 border-t border-[#EAECF0] flex items-center justify-between gap-4">
                <div className="flex-1 text-sm text-[#475467]">
                   <span className="font-medium text-[#101828]">Page {table.getState().pagination.pageIndex + 1}</span> of{" "}
                   <span className="font-medium text-[#101828]">{table.getPageCount()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="text-[#344054] hover:bg-[#F9FAFB]"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    
                    {/* Page Numbers - Simplified for now */}
                    <div className="flex items-center gap-1 mx-2">
                        {[...Array(Math.min(table.getPageCount(), 5))].map((_, i) => (
                            <Button
                                key={i}
                                variant={table.getState().pagination.pageIndex === i ? "default" : "ghost"}
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-lg text-xs font-semibold",
                                    table.getState().pagination.pageIndex === i 
                                        ? "bg-[#0E3B5D] text-white hover:bg-[#0E3B5D]/90" 
                                        : "text-[#475467] hover:bg-[#F9FAFB]"
                                )}
                                onClick={() => table.setPageIndex(i)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="text-[#344054] hover:bg-[#F9FAFB]"
                    >
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Sub-components for shadcn table structure (if not yet exists)
// We'll create these as standalone UI components if needed, or inline them.
// Since I don't see table.tsx in components/ui, I'll provide a basic implementation below or create it.
