"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    MoreHorizontal,
    FileDown,
    Plus,
    Shield,
    Users,
    UserCog,
    Trash2,
    Pencil,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserWithWallet, usersService } from "@/services/users";
import { countryService } from "@/services/countries";
import {
    adminService,
    type TeamMember,
    type Role,
    type Permission,
    type CreateTeamMemberPayload,
} from "@/services/admin";
import { format } from "date-fns";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PROTECTED_SLUGS = ["super-admin", "admin", "user", "fundraiser"];

const statusBadge = (status: string) => (
    <div
        className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center capitalize",
            status === "active" && "bg-green-50 text-green-700 border border-green-200",
            status === "suspended" && "bg-red-50 text-red-700 border border-red-200",
            status === "deactivated" && "bg-gray-100 text-gray-500 border border-gray-200",
        )}
    >
        {status}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 – Members (regular platform users)
// ─────────────────────────────────────────────────────────────────────────────

function ChangeRoleDialog({
    user,
    roles,
    open,
    onOpenChange,
}: {
    user: UserWithWallet;
    roles: Role[];
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [roleId, setRoleId] = React.useState<string>(
        String(user.role?.id ?? ""),
    );
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () =>
            usersService.updateUser(user.id, { role_id: Number(roleId) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Role updated successfully");
            onOpenChange(false);
        },
        onError: (e: Error) => toast.error(e.message || "Failed to update role"),
    });

    // Only non-user / non-fundraiser admin roles make sense to assign to regular users
    const assignableRoles = roles.filter(
        (r) => !["super-admin"].includes(r.slug),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Role</DialogTitle>
                    <DialogDescription>
                        Update the role for{" "}
                        <strong>
                            {user.profile?.first_name} {user.profile?.last_name}
                        </strong>
                        .
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <Label>Select Role</Label>
                    <Select value={roleId} onValueChange={setRoleId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {assignableRoles.map((r) => (
                                <SelectItem key={r.id} value={String(r.id)}>
                                    {r.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !roleId}
                    >
                        {mutation.isPending ? "Saving…" : "Save Role"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MemberActionCell({
    user,
    roles,
}: {
    user: UserWithWallet;
    roles: Role[];
}) {
    const [isSuspendOpen, setIsSuspendOpen] = React.useState(false);
    const [isChangeRoleOpen, setIsChangeRoleOpen] = React.useState(false);
    const queryClient = useQueryClient();
    const isSuspended = user.status === "suspended";

    const blockMutation = useMutation({
        mutationFn: () => usersService.blockUser(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsSuspendOpen(false);
        },
        onError: (e: Error) => {
            toast.error(e.message || "Failed to suspend user");
            setIsSuspendOpen(false);
        },
    });

    const unblockMutation = useMutation({
        mutationFn: () => usersService.unblockUser(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsSuspendOpen(false);
        },
        onError: (e: Error) => {
            toast.error(e.message || "Failed to unsuspend user");
            setIsSuspendOpen(false);
        },
    });

    const isSubmitting = blockMutation.isPending || unblockMutation.isPending;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#667085]"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/users/${user.id}`}>
                            View Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsChangeRoleOpen(true)}>
                        Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className={
                            isSuspended ? "text-green-600" : "text-red-600"
                        }
                        onClick={() => setIsSuspendOpen(true)}
                    >
                        {isSuspended ? "Unsuspend User" : "Suspend User"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Suspend / Unsuspend Dialog */}
            <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isSuspended ? "Unsuspend User" : "Suspend User"}
                        </DialogTitle>
                        <DialogDescription>
                            {isSuspended
                                ? `Are you sure you want to unsuspend ${user.profile?.first_name || "this user"}? They will regain access to the platform.`
                                : `Are you sure you want to suspend ${user.profile?.first_name || "this user"}? They will lose access to the platform until unsuspended.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsSuspendOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={
                                isSuspended
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                            }
                            onClick={() =>
                                isSuspended
                                    ? unblockMutation.mutate()
                                    : blockMutation.mutate()
                            }
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Processing…"
                                : isSuspended
                                  ? "Unsuspend"
                                  : "Suspend"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <ChangeRoleDialog
                user={user}
                roles={roles}
                open={isChangeRoleOpen}
                onOpenChange={setIsChangeRoleOpen}
            />
        </>
    );
}

function MembersTab({ roles }: { roles: Role[] }) {
    const { data: usersRes, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => usersService.getUsers(),
    });

    const users = React.useMemo(() => usersRes?.data ?? [], [usersRes]);

    const columns: ColumnDef<UserWithWallet>[] = [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => (
                <span className="text-[#667085]">{row.index + 1}</span>
            ),
        },
        {
            id: "name",
            header: "Name",
            accessorFn: (row) =>
                `${row.profile?.first_name || ""} ${row.profile?.last_name || ""}`.trim(),
            cell: ({ row }) => (
                <Link
                    href={`/dashboard/users/${row.original.id}`}
                    className="font-medium text-[#101828] hover:text-[#0E3B5D] hover:underline"
                >
                    {row.getValue("name") || "—"}
                </Link>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className="text-[#475467]">{row.getValue("email")}</span>
            ),
        },
        {
            id: "role",
            header: "Role",
            accessorFn: (row) => row.role?.name,
            cell: ({ row }) => (
                <span className="text-[#475467]">{row.getValue("role")}</span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date Joined",
            cell: ({ row }) => {
                const date = row.getValue("created_at") as string;
                return (
                    <span className="text-[#475467]">
                        {date ? format(new Date(date), "dd-MM-yyyy") : "-"}
                    </span>
                );
            },
        },
        {
            id: "active_plan",
            header: "Active Plan",
            cell: ({ row }) => {
                const planName = row.original.plan?.name;
                return (
                    <span className="text-[#475467]">
                        {planName ? planName : "-"}
                    </span>
                );
            },
        },
        {
            id: "status",
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) =>
                statusBadge(row.getValue("status") as string),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <MemberActionCell user={row.original} roles={roles} />
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            title="Members"
            isLoading={isLoading}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 – Team Members (administrative users)
// ─────────────────────────────────────────────────────────────────────────────

function AddTeamMemberDialog({
    open,
    onOpenChange,
    roles,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    roles: Role[];
}) {
    const queryClient = useQueryClient();
    const { data: countriesRes } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
    });
    const countries = countriesRes?.data ?? [];

    const [form, setForm] = React.useState<Partial<CreateTeamMemberPayload>>({
        gender: "male",
    });

    const adminRoles = roles.filter(
        (r) => !["user", "fundraiser"].includes(r.slug),
    );

    const handleChange = (field: keyof CreateTeamMemberPayload, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const mutation = useMutation({
        mutationFn: () =>
            adminService.createTeamMember(form as CreateTeamMemberPayload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast.success("Team member added successfully");
            onOpenChange(false);
            setForm({ gender: "male" });
        },
        onError: (e: Error) =>
            toast.error(e.message || "Failed to add team member"),
    });

    const isValid =
        form.first_name &&
        form.last_name &&
        form.email &&
        form.password &&
        form.role_id &&
        form.country_id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Create a new administrative user with platform access.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-2">
                    {/* First Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tm-first-name">First Name *</Label>
                        <Input
                            id="tm-first-name"
                            placeholder="First name"
                            value={form.first_name ?? ""}
                            onChange={(e) =>
                                handleChange("first_name", e.target.value)
                            }
                        />
                    </div>
                    {/* Last Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tm-last-name">Last Name *</Label>
                        <Input
                            id="tm-last-name"
                            placeholder="Last name"
                            value={form.last_name ?? ""}
                            onChange={(e) =>
                                handleChange("last_name", e.target.value)
                            }
                        />
                    </div>
                    {/* Email */}
                    <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="tm-email">Email *</Label>
                        <Input
                            id="tm-email"
                            type="email"
                            placeholder="email@example.com"
                            value={form.email ?? ""}
                            onChange={(e) =>
                                handleChange("email", e.target.value)
                            }
                        />
                    </div>
                    {/* Phone */}
                    <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="tm-phone">Phone</Label>
                        <Input
                            id="tm-phone"
                            placeholder="+234 800 000 0000"
                            value={form.phone ?? ""}
                            onChange={(e) =>
                                handleChange("phone", e.target.value)
                            }
                        />
                    </div>
                    {/* Password */}
                    <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="tm-password">Password *</Label>
                        <Input
                            id="tm-password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={form.password ?? ""}
                            onChange={(e) =>
                                handleChange("password", e.target.value)
                            }
                        />
                    </div>
                    {/* Country */}
                    <div className="col-span-2 space-y-1.5">
                        <Label>Country *</Label>
                        <Select
                            value={form.country_id ? String(form.country_id) : ""}
                            onValueChange={(v) =>
                                handleChange("country_id", Number(v))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                                {countries.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Role */}
                    <div className="col-span-2 space-y-1.5">
                        <Label>Role *</Label>
                        <Select
                            value={form.role_id ? String(form.role_id) : ""}
                            onValueChange={(v) =>
                                handleChange("role_id", Number(v))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Assign a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {adminRoles.map((r) => (
                                    <SelectItem key={r.id} value={String(r.id)}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Gender */}
                    <div className="space-y-1.5">
                        <Label>Gender</Label>
                        <Select
                            value={form.gender ?? "male"}
                            onValueChange={(v) => handleChange("gender", v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tm-dob">Date of Birth</Label>
                        <Input
                            id="tm-dob"
                            type="date"
                            value={form.dob ?? ""}
                            onChange={(e) =>
                                handleChange("dob", e.target.value)
                            }
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !isValid}
                    >
                        {mutation.isPending ? "Adding…" : "Add Team Member"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditTeamMemberDialog({
    member,
    roles,
    open,
    onOpenChange,
}: {
    member: TeamMember;
    roles: Role[];
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const queryClient = useQueryClient();
    const [roleId, setRoleId] = React.useState(String(member.role?.id ?? ""));
    const [status, setStatus] = React.useState(member.status ?? "active");

    const adminRoles = roles.filter(
        (r) => !["user", "fundraiser"].includes(r.slug),
    );

    const mutation = useMutation({
        mutationFn: () =>
            adminService.updateTeamMember(member.id, {
                role_id: Number(roleId),
                status: status as "active" | "suspended" | "deactivated",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast.success("Team member updated");
            onOpenChange(false);
        },
        onError: (e: Error) =>
            toast.error(e.message || "Failed to update team member"),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                    <DialogDescription>
                        Update role and status for{" "}
                        <strong>
                            {member.profile?.first_name}{" "}
                            {member.profile?.last_name}
                        </strong>
                        .
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label>Role</Label>
                        <Select value={roleId} onValueChange={setRoleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {adminRoles.map((r) => (
                                    <SelectItem key={r.id} value={String(r.id)}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="deactivated">Deactivated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Saving…" : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TeamMemberActionCell({
    member,
    roles,
}: {
    member: TeamMember;
    roles: Role[];
}) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => adminService.deleteTeamMember(member.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast.success("Team member removed");
            setDeleteOpen(false);
        },
        onError: (e: Error) =>
            toast.error(e.message || "Failed to remove team member"),
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#667085]"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/users/${member.id}`}>
                            View Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        Edit Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteOpen(true)}
                    >
                        Remove Member
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditTeamMemberDialog
                member={member}
                roles={roles}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Team Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove{" "}
                            <strong>
                                {member.profile?.first_name}{" "}
                                {member.profile?.last_name}
                            </strong>{" "}
                            from the team? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending
                                ? "Removing…"
                                : "Remove Member"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function TeamMembersTab({ roles }: { roles: Role[] }) {
    const [addOpen, setAddOpen] = React.useState(false);

    const { data: membersRes, isLoading } = useQuery({
        queryKey: ["team-members"],
        queryFn: () => adminService.getTeamMembers(),
    });

    const members: TeamMember[] = React.useMemo(
        () => membersRes?.data ?? [],
        [membersRes],
    );

    const columns: ColumnDef<TeamMember>[] = [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => (
                <span className="text-[#667085]">{row.index + 1}</span>
            ),
        },
        {
            id: "name",
            header: "Name",
            accessorFn: (row) =>
                `${row.profile?.first_name || ""} ${row.profile?.last_name || ""}`.trim(),
            cell: ({ row }) => (
                <Link
                    href={`/dashboard/users/${row.original.id}`}
                    className="font-medium text-[#101828] hover:text-[#0E3B5D] hover:underline"
                >
                    {row.getValue("name") || "—"}
                </Link>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className="text-[#475467]">{row.getValue("email")}</span>
            ),
        },
        {
            id: "role",
            header: "Role",
            accessorFn: (row) => row.role?.name,
            cell: ({ row }) => (
                <span className="inline-flex items-center gap-1.5 text-[#475467]">
                    <Shield className="h-3.5 w-3.5 text-primary/70" />
                    {row.getValue("role")}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Added On",
            cell: ({ row }) => {
                const date = row.getValue("created_at") as string;
                return (
                    <span className="text-[#475467]">
                        {date ? format(new Date(date), "dd-MM-yyyy") : "-"}
                    </span>
                );
            },
        },
        {
            id: "status",
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) =>
                statusBadge(row.getValue("status") as string),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <TeamMemberActionCell member={row.original} roles={roles} />
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2"
                    id="add-team-member-btn"
                >
                    <Plus className="h-4 w-4" />
                    Add Team Member
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={members}
                searchKey="name"
                title="Team Members"
                isLoading={isLoading}
            />
            <AddTeamMemberDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                roles={roles}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 – Roles & Permissions
// ─────────────────────────────────────────────────────────────────────────────

function RoleFormDialog({
    open,
    onOpenChange,
    permissions,
    editRole,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    permissions: Permission[];
    editRole?: Role | null;
}) {
    const queryClient = useQueryClient();
    const isEdit = !!editRole;
    const isProtected = editRole
        ? PROTECTED_SLUGS.includes(editRole.slug)
        : false;
    const isSuperAdmin = editRole?.slug === "super-admin";

    const [name, setName] = React.useState(editRole?.name ?? "");
    const [selected, setSelected] = React.useState<string[]>(
        editRole?.permissions.map((p) => p.name) ?? [],
    );

    // Sync when editRole changes
    React.useEffect(() => {
        setName(editRole?.name ?? "");
        setSelected(editRole?.permissions.map((p) => p.name) ?? []);
    }, [editRole]);

    const toggle = (permName: string) => {
        setSelected((prev) =>
            prev.includes(permName)
                ? prev.filter((n) => n !== permName)
                : [...prev, permName],
        );
    };

    const createMutation = useMutation({
        mutationFn: () =>
            adminService.createRole({ name, permissions: selected }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role created successfully");
            onOpenChange(false);
            setName("");
            setSelected([]);
        },
        onError: (e: Error) =>
            toast.error(e.message || "Failed to create role"),
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            adminService.updateRole(editRole!.id, {
                name: isProtected ? undefined : name,
                permissions: selected,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role updated successfully");
            onOpenChange(false);
        },
        onError: (e: Error) =>
            toast.error(e.message || "Failed to update role"),
    });

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Role" : "Create Role"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Update permissions for the "${editRole!.name}" role.`
                            : "Create a new role and assign permissions."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Role Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="role-name">Role Name *</Label>
                        <Input
                            id="role-name"
                            placeholder="e.g. Campaign Assistant"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isProtected}
                        />
                        {isProtected && (
                            <p className="text-xs text-[#667085] flex items-center gap-1 mt-0.5">
                                <Lock className="h-3 w-3" /> System-protected
                                role name cannot be changed.
                            </p>
                        )}
                    </div>

                    {/* Permissions Checklist */}
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        {isSuperAdmin && (
                            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 flex items-start gap-2">
                                <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                Super Admin permissions are managed by the
                                system and cannot be modified.
                            </div>
                        )}
                        <div className="space-y-2 rounded-md border border-[#EAECF0] p-4">
                            {permissions.map((perm) => (
                                <div
                                    key={perm.id}
                                    className="flex items-start gap-3"
                                >
                                    <Checkbox
                                        id={`perm-${perm.id}`}
                                        checked={selected.includes(perm.name)}
                                        onCheckedChange={() =>
                                            toggle(perm.name)
                                        }
                                        disabled={isSuperAdmin}
                                        className="mt-0.5"
                                    />
                                    <label
                                        htmlFor={`perm-${perm.id}`}
                                        className={cn(
                                            "text-sm cursor-pointer",
                                            isSuperAdmin && "cursor-default opacity-60",
                                        )}
                                    >
                                        <span className="font-medium text-[#101828] block">
                                            {perm.name
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (c) =>
                                                    c.toUpperCase(),
                                                )}
                                        </span>
                                        <span className="text-xs text-[#667085]">
                                            {perm.description}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            isEdit
                                ? updateMutation.mutate()
                                : createMutation.mutate()
                        }
                        disabled={isPending || (!isProtected && !name.trim())}
                    >
                        {isPending
                            ? "Saving…"
                            : isEdit
                              ? "Save Changes"
                              : "Create Role"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RolesPermissionsTab() {
    const queryClient = useQueryClient();
    const [roleFormOpen, setRoleFormOpen] = React.useState(false);
    const [editingRole, setEditingRole] = React.useState<Role | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<Role | null>(null);

    const { data: rolesRes, isLoading: rolesLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: () => adminService.getRoles(),
    });
    const { data: permsRes } = useQuery({
        queryKey: ["permissions"],
        queryFn: () => adminService.getPermissions(),
    });

    const roles: Role[] = rolesRes?.data ?? [];
    const permissions: Permission[] = permsRes?.data ?? [];

    const deleteMutation = useMutation({
        mutationFn: (role: Role) => adminService.deleteRole(role.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role deleted");
            setDeleteTarget(null);
        },
        onError: (e: Error) =>
            toast.error(e.message || "Failed to delete role"),
    });

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setRoleFormOpen(true);
    };

    const openCreate = () => {
        setEditingRole(null);
        setRoleFormOpen(true);
    };

    // Friendly label for permission badges
    const permLabel = (name: string) =>
        name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-end">
                <Button
                    onClick={openCreate}
                    className="flex items-center gap-2"
                    id="create-role-btn"
                >
                    <Plus className="h-4 w-4" />
                    Create Role
                </Button>
            </div>

            {/* Two-column layout: Roles list | Permissions legend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles List */}
                <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-sm font-semibold text-[#344054] uppercase tracking-wide">
                        Roles ({roles.length})
                    </h3>
                    {rolesLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-20 bg-[#F9FAFB] rounded-lg animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {roles.map((role) => {
                                const isProtected = PROTECTED_SLUGS.includes(
                                    role.slug,
                                );
                                return (
                                    <div
                                        key={role.id}
                                        className="flex items-start justify-between gap-4 rounded-lg border border-[#EAECF0] bg-white px-4 py-3"
                                    >
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-[#101828] text-sm">
                                                    {role.name}
                                                </span>
                                                {isProtected && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F0F5F9] text-primary border border-primary/20">
                                                        <Lock className="h-2.5 w-2.5" />
                                                        Protected
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.length ===
                                                0 ? (
                                                    <span className="text-xs text-[#98A2B3]">
                                                        No permissions assigned
                                                    </span>
                                                ) : (
                                                    role.permissions.map(
                                                        (p) => (
                                                            <span
                                                                key={p.id}
                                                                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
                                                            >
                                                                {permLabel(
                                                                    p.name,
                                                                )}
                                                            </span>
                                                        ),
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-[#667085] hover:text-primary"
                                                onClick={() => openEdit(role)}
                                                title="Edit role"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-[#667085] hover:text-red-600 disabled:opacity-40"
                                                onClick={() =>
                                                    setDeleteTarget(role)
                                                }
                                                disabled={isProtected}
                                                title={
                                                    isProtected
                                                        ? "Protected roles cannot be deleted"
                                                        : "Delete role"
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Permissions Legend */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[#344054] uppercase tracking-wide">
                        Available Permissions
                    </h3>
                    <div className="space-y-2">
                        {permissions.map((perm) => (
                            <div
                                key={perm.id}
                                className="rounded-lg border border-[#EAECF0] bg-white px-4 py-3 space-y-0.5"
                            >
                                <p className="text-xs font-semibold text-[#101828]">
                                    {permLabel(perm.name)}
                                </p>
                                <p className="text-xs text-[#667085] leading-snug">
                                    {perm.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Role Form Dialog */}
            <RoleFormDialog
                open={roleFormOpen}
                onOpenChange={(v) => {
                    setRoleFormOpen(v);
                    if (!v) setEditingRole(null);
                }}
                permissions={permissions}
                editRole={editingRole}
            />

            {/* Delete Confirmation */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the{" "}
                            <strong>{deleteTarget?.name}</strong> role? Users
                            with this role will be reassigned to the default
                            User role.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() =>
                                deleteTarget && deleteMutation.mutate(deleteTarget)
                            }
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting…" : "Delete Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────────────────────────

export default function UsersPage() {
    // Pre-load roles so they can be shared across the Members & Team Members tabs
    const { data: rolesRes } = useQuery({
        queryKey: ["roles"],
        queryFn: () => adminService.getRoles(),
    });
    const roles: Role[] = rolesRes?.data ?? [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">
                            User Management
                        </h2>
                        <p className="text-sm text-[#475467]">
                            Manage platform members, team access, and role
                            permissions.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-[#EAECF0] text-[#344054] font-semibold flex items-center gap-2"
                    >
                        <FileDown className="h-4 w-4" /> Export CSV
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="members" className="space-y-6">
                    <TabsList className="border border-[#EAECF0] bg-[#F9FAFB] p-1 h-auto rounded-lg">
                        <TabsTrigger
                            value="members"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
                            id="tab-members"
                        >
                            <Users className="h-4 w-4" />
                            Members
                        </TabsTrigger>
                        <TabsTrigger
                            value="team"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
                            id="tab-team"
                        >
                            <UserCog className="h-4 w-4" />
                            Team Members
                        </TabsTrigger>
                        <TabsTrigger
                            value="roles"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
                            id="tab-roles"
                        >
                            <Shield className="h-4 w-4" />
                            Roles & Permissions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members">
                        <MembersTab roles={roles} />
                    </TabsContent>

                    <TabsContent value="team">
                        <TeamMembersTab roles={roles} />
                    </TabsContent>

                    <TabsContent value="roles">
                        <RolesPermissionsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
