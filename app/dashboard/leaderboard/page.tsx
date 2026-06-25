"use client";

import DashboardLayout from "@/layout/dashboard";
import { LeaderboardView } from "@/components/dashboard/leaderboard/leaderboard-view";

export default function LeaderboardPage() {
    return (
        <DashboardLayout>
            <LeaderboardView />
        </DashboardLayout>
    );
}
