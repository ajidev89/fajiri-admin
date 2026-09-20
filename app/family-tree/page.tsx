"use client";

import DashboardLayout from "@/layout/dashboard";
import { FamilyListView } from "@/components/dashboard/family-tree/tree-view";

export default function FamilyTreePage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">
                            Family Tree
                        </h2>
                        <p className="text-xs sm:text-sm text-[#475467]">
                            View the hierarchical structure of members and their downlines.
                        </p>
                    </div>
                </div>

                <FamilyListView />
            </div>
        </DashboardLayout>
    );
}
