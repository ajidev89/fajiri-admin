"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Phone,
    UserPlus,
    Clock,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserWithWallet, usersService } from "@/services/users";
import { campaignService } from "@/services/campaigns";
import dayjs from "dayjs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";



export default function UserDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const [isSuspendModalOpen, setIsSuspendModalOpen] = React.useState(false);

    const {
        data: userRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["user", id],
        queryFn: () => usersService.getUserById(id),
    });

    const { data: campaignsRes, isLoading: isCampaignsLoading } = useQuery({
        queryKey: ["user-campaigns", id],
        queryFn: () => campaignService.getUserDonatedCampaigns({ user_id: id }),
    });

    const { data: auditsRes, isLoading: isAuditsLoading } = useQuery({
        queryKey: ["user-audits", id],
        queryFn: () => usersService.getUserAudits(id),
    });

    const { data: transactionsRes, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ["user-transactions", id],
        queryFn: () => usersService.getUserTransactions(id),
    });

    const user = userRes?.data;
    const donatedCampaigns = campaignsRes?.data || [];
    const audits = auditsRes?.data || [];
    const transactions = transactionsRes?.data || [];

    const isSuspended = user?.status === "suspended";

    const blockMutation = useMutation({
        mutationFn: () => usersService.blockUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", id] });
            setIsSuspendModalOpen(false);
            toast.success("User suspended successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to suspend user");
        },
    });

    const unblockMutation = useMutation({
        mutationFn: () => usersService.unblockUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", id] });
            setIsSuspendModalOpen(false);
            toast.success("User unsuspended successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to unsuspend user");
        },
    });

    const handleConfirm = () => {
        if (isSuspended) {
            unblockMutation.mutate();
        } else {
            blockMutation.mutate();
        }
    };

    const isSubmitting = blockMutation.isPending || unblockMutation.isPending;


    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            href="/dashboard/users"
                            className="text-[#667085] hover:text-primary transition-colors"
                        >
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">
                            User Details
                        </span>
                    </div>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            href="/dashboard/users"
                            className="text-[#667085] hover:text-primary transition-colors"
                        >
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">
                            User Details
                        </span>
                    </div>
                    <div className="flex items-center justify-center h-64">
                        <p className="text-red-500">Failed to load user data</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
                {/* Breadcrumbs & Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            href="/dashboard/users"
                            className="text-[#667085] hover:text-primary transition-colors"
                        >
                            Back
                        </Link>
                        <ChevronRight className="h-4 w-4 text-[#D0D5DD]" />
                        <span className="font-semibold text-[#101828]">
                            User Details
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-[#667085] bg-white border border-[#EAECF0] rounded-xl hover:bg-gray-50"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                            <DropdownMenuItem className="rounded-lg cursor-pointer">
                                Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className={cn(
                                    "rounded-lg cursor-pointer font-medium",
                                    isSuspended ? "text-green-600 focus:text-green-600 focus:bg-green-50" : "text-red-600 focus:text-red-600 focus:bg-red-50"
                                )}
                                onClick={() => setIsSuspendModalOpen(true)}
                            >
                                {isSuspended ? "Unsuspend User" : "Suspend User"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
                    {/* Left Sidebar - Profile Information */}
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm p-8 text-center flex flex-col items-center gap-4">
                            <Avatar className="h-24 w-24 ring-4 ring-gray-50 ring-offset-0">
                                <AvatarImage
                                    src={user?.profile.avatar ?? ""}
                                    alt={user?.profile.first_name}
                                />
                                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                                    {user?.profile.first_name?.charAt(0)}{" "}
                                    {user?.profile.last_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-[#101828]">
                                    {user?.profile.first_name}{" "}
                                    {user?.profile.last_name}
                                </h3>
                                <p className="text-sm text-[#475467]">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Basic Information Card */}
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828]">
                                    Basic Information
                                </h4>
                            </div>
                            <div className="p-8 space-y-6">
                                <InfoItem label="Member ID" value={user?.member_id ?? ""} />
                                <InfoItem
                                    label="Account Plan"
                                    value={user?.account_type ?? ""}
                                />
                                {/* <InfoItem
                                    label="Expiration Date"
                                    value={user?.expiration_date}
                                /> */}
                                <InfoItem
                                    label="Phone Number"
                                    value={user?.phone ?? ""}
                                />
                                <InfoItem
                                    label="Role"
                                    value={user?.role?.name ?? ""}
                                />
                                <InfoItem
                                    label="Date Joined"
                                    value={user?.created_at ?? ""}
                                />
                                <InfoItem
                                    label="Last Active"
                                    value={user?.last_login_at ?? ""}
                                />
                            </div>
                        </div>

                        {/* Profile Status Card */}
                        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828]">
                                    Profile Status
                                </h4>
                            </div>
                            <div className="p-8 space-y-6">
                                <StatusItem
                                    label="Status"
                                    value={user?.status ?? ""}
                                    icon={
                                        <div className={cn(
                                            "h-2.5 w-2.5 rounded-full",
                                            isSuspended ? "bg-red-500" : "bg-green-500"
                                        )} />
                                    }
                                />
                                <StatusItem
                                    label="Email Verified"
                                    value={
                                        user?.email_verified_at ? "Yes" : "No"
                                    }
                                    icon={
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    }
                                />
                                <StatusItem
                                    label="KYC Verified"
                                    value="Yes"
                                    icon={
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    }
                                />
                                 <InfoItem
                                     label="Last Password Change"
                                     value={(user as any)?.last_password_change ?? ""}
                                 />
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Activity Tabs */}
                    <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden min-h-[600px]">
                        <Tabs
                            defaultValue="account"
                            className="w-full h-full flex flex-col"
                        >
                            <div className="px-8 pt-6 border-b border-[#EAECF0]">
                                <h4 className="font-bold text-[#101828] mb-6">
                                    Activity
                                </h4>
                                <TabsList className="h-auto bg-transparent p-0 gap-8 justify-start border-none">
                                    <TabsTrigger
                                        value="account"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Account
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="campaign"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Campaign
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="financial"
                                        className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                                    >
                                        Financial
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent
                                value="account"
                                className="flex-1 p-8 focus-visible:ring-0"
                            >
                                {isAuditsLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : audits.length > 0 ? (
                                    <div className="space-y-8 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#EAECF0] ml-0.5" />

                                        {audits.map((log, index) => (
                                            <div
                                                key={log.id}
                                                className="pl-8 relative group"
                                            >
                                                <div className="absolute left-[-3px] top-1.5 h-2 w-2 rounded-full bg-[#EAECF0] ring-4 ring-white" />
                                                <div className="space-y-2">
                                                    <p className="text-[#101828] font-medium leading-tight">
                                                        {log.description}
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-[#475467]">
                                                            {dayjs(log.created_at).format("DD MMM YYYY • hh:mm A")}
                                                        </p>
                                                        <p className="text-xs text-[#667085]">
                                                            Action: <span className="capitalize">{log.action.replace(/_/g, ' ')}</span>
                                                            {log.performer && ` • Performed by: ${log.performer.profile?.first_name} ${log.performer.profile?.last_name}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 text-[#667085]">
                                        No account activity recorded.
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent
                                value="campaign"
                                className="p-8 focus-visible:ring-0"
                            >
                                {isCampaignsLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : donatedCampaigns.length > 0 ? (
                                    <div className="space-y-6 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#EAECF0] ml-0.5" />
                                        {donatedCampaigns.map((campaign, index) => (
                                            <div key={campaign.id} className="pl-8 relative group">
                                                <div className="absolute left-[-3px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-white" />
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[#101828] font-bold leading-tight">
                                                            Donated to: {campaign.title}
                                                        </p>
                                                        <Badge variant="outline" className="capitalize text-[10px]">
                                                            {campaign.type}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-[#475467]">
                                                            {dayjs(campaign.created_at).format("DD MMM YYYY • hh:mm A")}
                                                        </p>
                                                        <p className="text-xs text-[#667085] line-clamp-2">
                                                            {campaign.body}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 text-[#667085]">
                                        No campaign activity recorded.
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent
                                value="financial"
                                className="p-8 focus-visible:ring-0"
                            >
                                {isTransactionsLoading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <div className="space-y-6">
                                        {transactions.map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-4 border border-[#EAECF0] rounded-2xl bg-gray-50/50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                                        (tx.type === "credit" || tx.type === "deposit") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                    )}>
                                                        <History className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-[#101828]">
                                                            {tx.description || "Wallet Transaction"}
                                                        </p>
                                                        <p className="text-xs text-[#667085]">
                                                            {dayjs(tx.created_at).format("DD MMM YYYY • hh:mm A")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        (tx.type === "credit" || tx.type === "deposit") ? "text-green-600" : "text-red-600"
                                                    )}>
                                                        {(tx.type === "credit" || tx.type === "deposit") ? "+" : "-"}{tx.currency}{Number(tx.amount).toLocaleString()}
                                                    </p>
                                                    <Badge variant="outline" className={cn(
                                                        "capitalize text-[10px]",
                                                        tx.status === "completed" || tx.status === "success" ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"
                                                    )}>
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 text-[#667085]">
                                        No financial activity recorded.
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <Dialog
                open={isSuspendModalOpen}
                onOpenChange={setIsSuspendModalOpen}
            >
                <DialogContent className="rounded-3xl max-w-md p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#101828]">
                            {isSuspended ? "Unsuspend User" : "Suspend User"}
                        </DialogTitle>
                        <DialogDescription className="text-[#475467] pt-2">
                            {isSuspended
                                ? `Are you sure you want to unsuspend ${user?.profile?.first_name || "this user"}? They will regain access to the platform.`
                                : `Are you sure you want to suspend ${user?.profile?.first_name || "this user"}? They will lose access to the platform until unsuspended.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-8 gap-3 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsSuspendModalOpen(false)}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl h-11 border-[#EAECF0] text-[#344054] font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            className={cn(
                                "flex-1 rounded-xl h-11 font-semibold text-white",
                                isSuspended
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                            )}
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Processing..."
                                : isSuspended
                                  ? "Unsuspend"
                                  : "Suspend"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#667085]">{label}:</span>
            <span className="font-bold text-[#101828] text-right">{value}</span>
        </div>
    );
}

function StatusItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#667085]">{label}:</span>
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-bold text-[#101828]">{value}</span>
            </div>
        </div>
    );
}
