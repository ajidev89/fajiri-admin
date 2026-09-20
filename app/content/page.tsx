"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Plus } from "lucide-react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    EVENT_STATUS_FILTER,
    listMeta,
    POLL_STATUS_FILTER,
    POST_STATUS_FILTER,
    STATUS_FILTER,
    useServerTable,
} from "@/lib/use-server-table";
import { MediaLibrary } from "@/components/dashboard/content/media-library";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    blogService,
    type BlogPost,
    eventService,
    type Event,
    partnerService,
    type Partner,
    initiativeService,
    type Initiative,
    insuranceService,
    type Insurance,
    countryService,
    pollService,
    type Poll,
} from "@/services";
import { format } from "date-fns";
import { toast } from "sonner";
import { InitiativeModal } from "@/components/dashboard/content/initiatives/initiative-modal";
import { InsuranceModal } from "@/components/dashboard/content/insurances/insurance-modal";
import {
    BlogPreviewModal,
    blogPostToPreview,
    type BlogPreviewData,
} from "@/components/dashboard/content/blog-preview-modal";
import { useAuthStore } from "@/store/auth-store";

const CONTENT_TABS = [
    "blog",
    "events",
    "partners",
    "initiatives",
    "insurances",
    "media",
    "polls",
] as const;

// Mock data removed in favor of API

// Columns definition with checkboxes
const getColumns = (
    onDelete: (id: string) => void,
    onPreview: (post: BlogPost) => void,
): ColumnDef<BlogPost>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return (
                <div className="max-w-[300px] font-medium text-[#101828] truncate">
                    {row.getValue("title")}
                </div>
            );
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.original.category;
            return (
                <span className="font-semibold text-xs text-[#475467]">
                    {category?.name || "Uncategorized"}
                </span>
            );
        },
    },
    {
        accessorKey: "published_at",
        header: "Published Date",
        cell: ({ row }) => {
            const date = row.getValue("published_at") as string;
            return date
                ? format(new Date(date), "dd-MM-yyyy")
                : "Not Published";
        },
    },
    {
        accessorKey: "created_at",
        header: "Last Updated",
        cell: ({ row }) => {
            return format(new Date(row.original.created_at), "dd-MM-yyyy");
        },
    },
    {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => {
            const author = row.original.author;
            const profile = author?.profile;
            const name = profile
                ? `${profile.first_name} ${profile.last_name}`
                : author?.username || "Admin";
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={profile?.avatar || ""} />
                        <AvatarFallback>
                            {name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-[#101828]">
                        {name}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={
                        status === "published"
                            ? "success"
                            : status === "scheduled"
                              ? "warning"
                              : "default"
                    }
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
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
                    <DropdownMenuItem
                        onClick={() => onPreview(row.original)}
                    >
                        Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/content/edit/${row.original.slug}`}
                        >
                            Edit Post
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>View on Site</DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(row.original.id)}
                    >
                        Delete Post
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

const getEventColumns = (
    onDelete: (id: string) => void,
): ColumnDef<Event>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "title",
        header: "Event Title",
        cell: ({ row }) => (
            <div className="max-w-[250px] font-medium text-[#101828] truncate">
                {row.getValue("title")}
            </div>
        ),
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
            const location = row.getValue("location") as string;
            return (
                <span className="text-sm text-[#475467]">
                    {location || "Virtual"}
                </span>
            );
        },
    },
    {
        accessorKey: "start_date",
        header: "Date",
        cell: ({ row }) => {
            const date = row.getValue("start_date") as string;
            return date ? format(new Date(date), "MMM dd, yyyy") : "TBA";
        },
    },
    {
        accessorKey: "slots",
        header: "Slots",
        cell: ({ row }) => {
            const available = row.original.attendees_count;
            const total =
                row.original.slots_available + row.original.attendees_count;
            return (
                <div className="text-sm text-[#475467]">
                    <span className="font-semibold text-[#101828]">
                        {available}
                    </span>{" "}
                    / {total}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={
                        status === "upcoming"
                            ? "success"
                            : status === "ongoing"
                              ? "warning"
                              : "default"
                    }
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
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
                        <Link
                            href={`/content/events/edit/${row.original.slug}`}
                        >
                            Edit Event
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(row.original.id)}
                    >
                        Delete Event
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

const getPartnerColumns = (
    onDelete: (id: string) => void,
): ColumnDef<Partner>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "logo",
        header: "Logo",
        cell: ({ row }) => (
            <Avatar className="h-10 w-10 rounded-lg border border-[#EAECF0]">
                <AvatarImage
                    src={row.original.logo || ""}
                    className="object-cover"
                />
                <AvatarFallback className="rounded-lg bg-[#F9FAFB] text-xs">
                    {row.original.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
        ),
    },
    {
        accessorKey: "name",
        header: "Partner Name",
        cell: ({ row }) => (
            <div className="font-medium text-[#101828]">
                {row.getValue("name")}
            </div>
        ),
    },
    {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
            const website = row.getValue("website") as string;
            return website ? (
                <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                >
                    {new URL(website).hostname}
                </a>
            ) : (
                <span className="text-sm text-[#667085]">N/A</span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Joined Date",
        cell: ({ row }) =>
            format(new Date(row.original.created_at), "MMM dd, yyyy"),
    },
    {
        id: "actions",
        cell: ({ row }) => (
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
                        <Link
                            href={`/content/partners/edit/${row.original.slug}`}
                        >
                            Edit Partner
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(row.original.id)}
                    >
                        Delete Partner
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

const getInitiativeColumns = (
    onEdit: (initiative: Initiative) => void,
    onDelete: (id: string) => void,
): ColumnDef<Initiative>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => (
            <Avatar className="h-10 w-10 rounded-lg border border-[#EAECF0]">
                <AvatarImage
                    src={row.original.image || ""}
                    className="object-cover"
                />
                <AvatarFallback className="rounded-lg bg-[#F9FAFB] text-xs">
                    {row.original.title.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="font-medium text-[#101828] max-w-[200px] truncate">
                {row.getValue("title")}
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="text-sm text-[#475467] max-w-[300px] truncate">
                {row.getValue("description")}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={status === "active" ? "success" : "default"}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Date Created",
        cell: ({ row }) =>
            format(new Date(row.original.created_at), "MMM dd, yyyy"),
    },
    {
        id: "actions",
        cell: ({ row }) => (
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
                    <DropdownMenuItem onClick={() => onEdit(row.original)}>
                        Edit Initiative
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(row.original.id)}
                    >
                        Delete Initiative
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

const getInsuranceColumns = (
    onEdit: (insurance: Insurance) => void,
    onDelete: (id: string) => void,
): ColumnDef<Insurance>[] => [
    {
        accessorKey: "logo",
        header: "Logo",
        cell: ({ row }) => (
            <Avatar className="h-10 w-10 rounded-lg border border-[#EAECF0] bg-white">
                <AvatarImage
                    src={row.original.logo || ""}
                    className="object-contain p-1"
                />
                <AvatarFallback className="rounded-lg bg-[#F9FAFB] text-xs">
                    {row.original.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
        ),
    },
    {
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => (
            <div className="font-semibold text-[#101828]">
                {row.getValue("name")}
            </div>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("type")}
            </Badge>
        ),
    },
    {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
            <div className="text-sm text-[#475467]">
                {row.original.email}
            </div>
        ),
    },
    {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span>{row.original.country?.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={status === "active" ? "success" : "default"}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
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
                    <DropdownMenuItem onClick={() => onEdit(row.original)}>
                        Edit Provider
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(row.original.id)}
                    >
                        Delete Provider
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

const getPollColumns = (
    onEdit: (poll: Poll) => void,
    onDelete: (id: number) => void,
): ColumnDef<Poll>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <Link
                href={`/content/polls/${row.original.id}`}
                className="font-medium text-[#101828] max-w-[250px] truncate block hover:text-primary hover:underline"
            >
                {row.getValue("title")}
            </Link>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {(row.getValue("type") as string).replace("_", " ")}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={
                        status === "active"
                            ? "success"
                            : status === "draft"
                              ? "warning"
                              : "default"
                    }
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "participants_count",
        header: "Participants",
        cell: ({ row }) => (
            <div className="text-sm text-[#475467]">
                {row.original.participants_count || 0}
            </div>
        ),
    },
    {
        accessorKey: "ends_at",
        header: "Ends At",
        cell: ({ row }) => {
            const date = row.getValue("ends_at") as string;
            return date ? format(new Date(date), "MMM dd, yyyy HH:mm") : "N/A";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
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
                        <Link href={`/content/polls/${row.original.id}`}>
                            View Poll
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/content/polls/${row.original.id}/edit`}>
                            Edit Poll
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(row.original.id)}
                    >
                        Delete Poll
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function ContentPage() {
    return (
        <React.Suspense
            fallback={
                <DashboardLayout>
                    <div className="bg-white rounded-2xl border border-[#EAECF0] h-96 animate-pulse" />
                </DashboardLayout>
            }
        >
            <ContentManagementPage />
        </React.Suspense>
    );
}

function ContentManagementPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const [selectedCountry, setSelectedCountry] = React.useState<string>("all");

    const tabParam = searchParams.get("tab");
    const activeTab = CONTENT_TABS.includes(tabParam as (typeof CONTENT_TABS)[number])
        ? tabParam!
        : "blog";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "blog") {
            params.delete("tab");
        } else {
            params.set("tab", value);
        }
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };
    
    // Initiative Modal state
    const [isInitiativeModalOpen, setIsInitiativeModalOpen] = React.useState(false);
    const [selectedInitiative, setSelectedInitiative] = React.useState<Initiative | null>(null);

    // Insurance Modal state
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = React.useState(false);
    const [selectedInsurance, setSelectedInsurance] = React.useState<Insurance | null>(null);

    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [previewPost, setPreviewPost] = React.useState<BlogPreviewData | null>(null);

    const isFundraiser = user?.role.slug === "fundraiser";
    const scopeExtra: Record<string, string | undefined> = {
        ...(isFundraiser && user?.id ? { added_by: user.id } : {}),
        ...(selectedCountry !== "all" ? { country_id: selectedCountry } : {}),
    };

    const postsTable = useServerTable({ sortBy: "title", extra: scopeExtra });
    const eventsTable = useServerTable({ sortBy: "title", extra: scopeExtra });
    const partnersTable = useServerTable({
        sortBy: "name",
        extra: selectedCountry !== "all" ? { country_id: selectedCountry } : {},
    });
    const initiativesTable = useServerTable({
        sortBy: "title",
        extra: isFundraiser && user?.id ? { added_by: user.id } : {},
    });
    const insurancesTable = useServerTable({
        sortBy: "name",
        extra: { all: "true" },
    });
    const pollsTable = useServerTable({ sortBy: "title", extra: scopeExtra });

    const { data: countriesRes } = useQuery({
        queryKey: ["countries"],
        queryFn: () => countryService.getCountries(),
    });
    const countries = countriesRes?.data || [];

    const { data: postsRes, isLoading: isLoadingPosts } = useQuery({
        queryKey: ["posts", postsTable.params],
        queryFn: () => blogService.getPosts(postsTable.params),
        placeholderData: keepPreviousData,
    });
    const { data: eventsRes, isLoading: isLoadingEvents } = useQuery({
        queryKey: ["events", eventsTable.params],
        queryFn: () => eventService.getEvents(eventsTable.params),
        placeholderData: keepPreviousData,
    });
    const { data: partnersRes, isLoading: isLoadingPartners } = useQuery({
        queryKey: ["partners", partnersTable.params],
        queryFn: () => partnerService.getPartners(partnersTable.params),
        placeholderData: keepPreviousData,
    });
    const { data: initiativesRes, isLoading: isLoadingInitiatives } = useQuery({
        queryKey: ["initiatives", initiativesTable.params],
        queryFn: () => initiativeService.getInitiatives(initiativesTable.params),
        placeholderData: keepPreviousData,
    });
    const { data: insurancesRes, isLoading: isLoadingInsurances } = useQuery({
        queryKey: ["insurances", insurancesTable.params],
        queryFn: () => insuranceService.getInsurances(insurancesTable.params),
        placeholderData: keepPreviousData,
    });
    const { data: pollsRes, isLoading: isLoadingPolls } = useQuery({
        queryKey: ["admin-polls", pollsTable.params],
        queryFn: () => pollService.getPolls(pollsTable.params),
        placeholderData: keepPreviousData,
    });

    const posts = postsRes?.data ?? [];
    const events = eventsRes?.data ?? [];
    const partners = partnersRes?.data ?? [];
    const initiatives = initiativesRes?.data ?? [];
    const insurances = insurancesRes?.data ?? [];
    const polls = pollsRes?.data ?? [];

    const handleDeletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            await blogService.deletePost(id);
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to delete post");
        }
    };

    const handlePreviewPost = async (post: BlogPost) => {
        try {
            const res = await blogService.getPost(post.slug);
            setPreviewPost(blogPostToPreview(res.data));
            setIsPreviewOpen(true);
        } catch (error: any) {
            toast.error(error.message || "Failed to load post preview");
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await eventService.deleteEvent(id);
            toast.success("Event deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["events"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to delete event");
        }
    };

    const handleDeletePartner = async (id: string) => {
        if (!confirm("Are you sure you want to delete this partner?")) return;

        try {
            await partnerService.deletePartner(id);
            toast.success("Partner deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["partners"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to delete partner");
        }
    };

    const handleDeleteInitiative = async (id: string) => {
        if (!confirm("Are you sure you want to delete this initiative?")) return;

        try {
            await initiativeService.deleteInitiative(id);
            toast.success("Initiative deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["initiatives"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to delete initiative");
        }
    };

    const handleEditInitiative = (initiative: Initiative) => {
        setSelectedInitiative(initiative);
        setIsInitiativeModalOpen(true);
    };

    const handleCreateInitiative = () => {
        setSelectedInitiative(null);
        setIsInitiativeModalOpen(true);
    };

    const handleDeleteInsurance = async (id: string) => {
        if (!confirm("Are you sure you want to delete this insurance provider?")) return;

        try {
            await insuranceService.deleteInsurance(id);
            toast.success("Insurance provider deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["insurances"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to delete insurance provider");
        }
    };

    const handleEditInsurance = (insurance: Insurance) => {
        setSelectedInsurance(insurance);
        setIsInsuranceModalOpen(true);
    };

    const handleCreateInsurance = () => {
        setSelectedInsurance(null);
        setIsInsuranceModalOpen(true);
    };

    const columns = React.useMemo(
        () => getColumns(handleDeletePost, handlePreviewPost),
        [handleDeletePost, handlePreviewPost],
    );
    const eventColumns = React.useMemo(
        () => getEventColumns(handleDeleteEvent),
        [handleDeleteEvent],
    );
    const partnerColumns = React.useMemo(
        () => getPartnerColumns(handleDeletePartner),
        [handleDeletePartner],
    );
    const initiativeColumns = React.useMemo(
        () => getInitiativeColumns(handleEditInitiative, handleDeleteInitiative),
        [handleEditInitiative, handleDeleteInitiative],
    );
    const insuranceColumns = React.useMemo(
        () => getInsuranceColumns(handleEditInsurance, handleDeleteInsurance),
        [handleEditInsurance, handleDeleteInsurance],
    );

    const handleEditPoll = (poll: Poll) => {
        router.push(`/content/polls/${poll.id}/edit`);
    };

    const handleCreatePoll = () => {
        router.push("/content/polls/create");
    };

    const handleDeletePoll = async (id: number) => {
        if (!confirm("Are you sure you want to delete this poll?")) return;

        try {
            await pollService.deletePoll(id);
            toast.success("Poll deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-polls"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to delete poll");
        }
    };

    const pollColumns = React.useMemo(
        () => getPollColumns(handleEditPoll, handleDeletePoll),
        [handleEditPoll, handleDeletePoll],
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">
                        Content Management
                    </h2>
                    <p className="text-xs sm:text-sm text-[#475467]">
                        Manage your blogs, events, partners, and media files.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="w-[180px] bg-white border-[#E9EEF2]">
                            <SelectValue placeholder="Filter by country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {countries.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="h-auto bg-transparent p-0 gap-4 md:gap-8 justify-start border-b border-[#EAECF0] w-full rounded-none flex-wrap">
                        <TabsTrigger
                            value="blog"
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Blog Posts
                        </TabsTrigger>
                        <TabsTrigger
                            value="events"
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Events
                        </TabsTrigger>
                        <TabsTrigger
                            value="partners"
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Partners
                        </TabsTrigger>
                        <TabsTrigger
                            value="initiatives"
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Initiatives
                        </TabsTrigger>
                        <TabsTrigger
                            value="insurances"
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Insurance
                        </TabsTrigger>
                        <TabsTrigger
                            value="media"
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Media
                        </TabsTrigger>
                        <TabsTrigger
                            value="polls"
                            className="h-auto px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none font-semibold text-[#667085]"
                        >
                            Polls
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="blog"
                        className="mt-8 space-y-6 focus-visible:ring-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-[#101828]">
                                Blog Posts
                            </h3>
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
                            >
                                <Link href="/content/create">
                                    <Plus className="h-4 w-4" /> New Post
                                </Link>
                            </Button>
                        </div>

                        <DataTable
                            columns={columns}
                            data={posts}
                            searchKey="title"
                            title="Blog Posts Table"
                            isLoading={isLoadingPosts}
                            {...postsTable.tableProps}
                            pageCount={listMeta(postsRes).pageCount}
                            total={listMeta(postsRes).total}
                            filterOptions={[POST_STATUS_FILTER]}
                            sortField="title"
                        />
                    </TabsContent>



                    <TabsContent
                        value="events"
                        className="mt-8 space-y-6 focus-visible:ring-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-[#101828]">
                                Events
                            </h3>
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
                            >
                                <Link href="/content/events/create">
                                    <Plus className="h-4 w-4" /> New Event
                                </Link>
                            </Button>
                        </div>

                        <DataTable
                            columns={eventColumns}
                            data={events}
                            searchKey="title"
                            title="Events Table"
                            isLoading={isLoadingEvents}
                            {...eventsTable.tableProps}
                            pageCount={listMeta(eventsRes).pageCount}
                            total={listMeta(eventsRes).total}
                            filterOptions={[EVENT_STATUS_FILTER]}
                            sortField="title"
                        />
                    </TabsContent>

                    <TabsContent
                        value="partners"
                        className="mt-8 space-y-6 focus-visible:ring-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-[#101828]">
                                Partners
                            </h3>
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
                            >
                                <Link href="/content/partners/create">
                                    <Plus className="h-4 w-4" /> New Partner
                                </Link>
                            </Button>
                        </div>

                        <DataTable
                            columns={partnerColumns}
                            data={partners}
                            searchKey="name"
                            title="Partners Table"
                            isLoading={isLoadingPartners}
                            {...partnersTable.tableProps}
                            pageCount={listMeta(partnersRes).pageCount}
                            total={listMeta(partnersRes).total}
                            sortField="name"
                        />
                    </TabsContent>

                    <TabsContent
                        value="media"
                        className="mt-8 focus-visible:ring-0"
                    >
                        <MediaLibrary />
                    </TabsContent>

                    <TabsContent
                        value="initiatives"
                        className="mt-8 space-y-6 focus-visible:ring-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-[#101828]">
                                Initiatives
                            </h3>
                            <Button
                                onClick={handleCreateInitiative}
                                className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> New Initiative
                            </Button>
                        </div>

                        <DataTable
                            columns={initiativeColumns}
                            data={initiatives}
                            searchKey="title"
                            title="Initiatives Table"
                            isLoading={isLoadingInitiatives}
                            {...initiativesTable.tableProps}
                            pageCount={listMeta(initiativesRes).pageCount}
                            total={listMeta(initiativesRes).total}
                            filterOptions={[STATUS_FILTER]}
                            sortField="title"
                        />
                    </TabsContent>

                    <TabsContent
                        value="insurances"
                        className="mt-8 space-y-6 focus-visible:ring-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-[#101828]">
                                Insurance Providers
                            </h3>
                            <Button
                                onClick={handleCreateInsurance}
                                className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add Provider
                            </Button>
                        </div>

                        <DataTable
                            columns={insuranceColumns}
                            data={insurances}
                            searchKey="name"
                            title="Insurance Providers Table"
                            isLoading={isLoadingInsurances}
                            {...insurancesTable.tableProps}
                            pageCount={listMeta(insurancesRes).pageCount}
                            total={listMeta(insurancesRes).total}
                            sortField="name"
                        />
                    </TabsContent>

                    <TabsContent
                        value="polls"
                        className="mt-8 space-y-6 focus-visible:ring-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-[#101828]">
                                Polls
                            </h3>
                            <Button
                                onClick={handleCreatePoll}
                                className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add Poll
                            </Button>
                        </div>

                        <DataTable
                            columns={pollColumns}
                            data={polls}
                            searchKey="title"
                            title="Polls Table"
                            isLoading={isLoadingPolls}
                            {...pollsTable.tableProps}
                            pageCount={listMeta(pollsRes).pageCount}
                            total={listMeta(pollsRes).total}
                            filterOptions={[POLL_STATUS_FILTER]}
                            sortField="title"
                        />
                    </TabsContent>
                </Tabs>

                <InitiativeModal
                    isOpen={isInitiativeModalOpen}
                    onOpenChange={setIsInitiativeModalOpen}
                    initialData={selectedInitiative}
                />

                <InsuranceModal
                    isOpen={isInsuranceModalOpen}
                    onOpenChange={setIsInsuranceModalOpen}
                    initialData={selectedInsurance}
                />

                <BlogPreviewModal
                    isOpen={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                    post={previewPost}
                />
            </div>
        </DashboardLayout>
    );
}
