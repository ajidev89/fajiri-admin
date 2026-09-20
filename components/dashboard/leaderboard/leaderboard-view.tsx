"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listMeta, useServerTable } from "@/lib/use-server-table";
import { leaderboardService, LeaderboardMember } from "@/services/leaderboard";
import { countryService } from "@/services/countries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function memberCountryIso(member: LeaderboardMember) {
    return (
        member.country_iso ||
        member.country_iso2 ||
        member.country?.iso2 ||
        ""
    ).toUpperCase();
}

function memberFlagSrc(member: LeaderboardMember) {
    if (member.country?.flag) return member.country.flag;
    const iso = memberCountryIso(member).toLowerCase();
    return iso ? `https://flagcdn.com/w40/${iso}.png` : "";
}

export function LeaderboardView() {
    const [selectedCountryId, setSelectedCountryId] = React.useState<string>("all");
    const tableState = useServerTable({
        sortBy: "total_engagement",
        extra: selectedCountryId !== "all" ? { country_id: selectedCountryId } : {},
    });

    const { data: countriesRes } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
    });
    const countries = countriesRes?.data || [];

    const { data: leaderboardRes, isLoading } = useQuery({
        queryKey: ["leaderboard", tableState.params],
        queryFn: () => leaderboardService.getLeaderboard(tableState.params),
        placeholderData: keepPreviousData,
    });
    const leaderboardMeta = listMeta(leaderboardRes);
    const members = leaderboardRes?.data || [];

    const columns: ColumnDef<LeaderboardMember>[] = [
        {
            id: "rank",
            header: "Rank",
            cell: ({ row }) => (
                <div className="font-semibold text-lg text-[#101828]">
                    #{row.index + 1}
                </div>
            ),
        },
        {
            accessorKey: "member",
            header: "Member",
            cell: ({ row }) => {
                const member = row.original;
                const fullName =
                    [member.profile?.first_name, member.profile?.last_name]
                        .filter(Boolean)
                        .join(" ") ||
                    member.name ||
                    "Unknown Member";

                const iso = memberCountryIso(member);
                const flagSrc = memberFlagSrc(member);

                return (
                    <Link
                        href={`/users/${member.id}`}
                        className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                    >
                        <div className="relative h-10 w-10 shrink-0">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={member.profile?.avatar || ""}
                                    className="object-cover"
                                />
                                <AvatarFallback>
                                    {member.profile?.first_name?.charAt(0) ||
                                        member.name?.charAt(0) ||
                                        "U"}
                                </AvatarFallback>
                            </Avatar>
                            {flagSrc && (
                                <img
                                    src={flagSrc}
                                    alt={iso ? `${iso} flag` : "Country flag"}
                                    className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full object-cover ring-2 ring-white"
                                />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-[#101828] group-hover:text-[#0E3B5D] group-hover:underline">
                                {fullName}
                            </span>
                        </div>
                    </Link>
                );
            },
        },
        {
            accessorKey: "member_id",
            header: "Member ID",
            cell: ({ row }) => (
                <span className="text-[#667085]">
                    {row.getValue("member_id")}
                </span>
            ),
        },
        {
            accessorKey: "country_iso2",
            header: "Country",
            cell: ({ row }) => (
                <span className="text-[#667085]">
                    {memberCountryIso(row.original) || "-"}
                </span>
            ),
        },
        {
            accessorKey: "campaign_donations_count",
            header: "Donations",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className="text-[#667085]">
                        {row.getValue("campaign_donations_count")}
                    </span>
                    <span className="text-xs text-[#667085]">pt</span>
                </div>
            ),
        },
        {
            accessorKey: "event_attendance_count",
            header: "Event Attendance",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className="text-[#667085]">
                        {row.getValue("event_attendance_count")}
                    </span>
                    <span className="text-xs text-[#667085]">pt</span>
                </div>
            ),
        },
        {
            accessorKey: "referrals_count",
            header: "Human outreach",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className="text-[#667085]">
                        {row.getValue("referrals_count") ?? 0}
                    </span>
                    <span className="text-xs text-[#667085]">pt</span>
                </div>
            ),
        },
        {
            accessorKey: "total_engagement",
            header: "Total Engagement",
            cell: ({ row }) => {
                const engagement = row.getValue("total_engagement") as number;
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0E3B5D]">
                            {engagement}
                        </span>
                        <span className="text-xs text-[#667085]">pts</span>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">
                        Leaderboard
                    </h2>
                    <p className="text-xs sm:text-sm text-[#475467]">
                        View the top engaged members in the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={selectedCountryId}
                        onValueChange={setSelectedCountryId}
                    >
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Filter by Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {countries.map((country) => (
                                <SelectItem
                                    key={country.id}
                                    value={country.id.toString()}
                                >
                                    {country.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={members}
                searchKey="username"
                title="Leaderboard Table"
                isLoading={isLoading}
                {...tableState.tableProps}
                pageCount={leaderboardMeta.pageCount}
                total={leaderboardMeta.total}
                sortField="total_engagement"
            />
        </div>
    );
}
