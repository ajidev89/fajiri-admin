import * as React from "react";

export type ServerSort = { id: string; desc: boolean };

export type TableFilterOption = {
    key: string;
    label: string;
    options: { value: string; label: string }[];
};

function useDebouncedValue(value: string, delay = 350) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export function listMeta(res: unknown) {
    const record = (res ?? {}) as Record<string, any>;
    const meta = (record.meta ?? {}) as Record<string, any>;
    return {
        pageCount: Number(meta.last_page ?? record.last_page ?? 1) || 1,
        total: (meta.total ?? record.total) as number | undefined,
    };
}

export function useServerTable(options?: {
    sortBy?: string;
    extra?: Record<string, string | undefined>;
    paginate?: boolean;
}) {
    const defaultSortBy = options?.sortBy ?? "created_at";
    const paginate = options?.paginate !== false;
    const extraKey = JSON.stringify(options?.extra ?? {});
    const [search, setSearchState] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [sort, setSortState] = React.useState<ServerSort | null>(null);
    const [filters, setFilters] = React.useState<Record<string, string>>({});
    const debouncedSearch = useDebouncedValue(search);

    const setSearch = React.useCallback((value: string) => {
        setSearchState(value);
        setPage(1);
    }, []);

    const setSort = React.useCallback((next: ServerSort) => {
        setSortState(next);
        setPage(1);
    }, []);

    const setFilter = React.useCallback((key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    }, []);

    React.useEffect(() => {
        setPage(1);
    }, [extraKey]);

    const params = React.useMemo(() => {
        const next: Record<string, string> = {};
        if (paginate) next.page = String(page);
        const term = debouncedSearch.trim();
        if (term) next.search = term;

        next.sort_by = sort?.id ?? defaultSortBy;
        next.sort_order = sort ? (sort.desc ? "desc" : "asc") : "desc";

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "all") next[key] = value;
        });
        const extra = extraKey
            ? (JSON.parse(extraKey) as Record<string, string | undefined>)
            : {};
        Object.entries(extra).forEach(([key, value]) => {
            if (value) next[key] = value;
        });
        return next;
    }, [debouncedSearch, defaultSortBy, extraKey, filters, page, paginate, sort]);

    return {
        search,
        setSearch,
        page,
        setPage,
        sort,
        setSort,
        filters,
        setFilter,
        params,
        tableProps: {
            searchValue: search,
            onSearchChange: setSearch,
            ...(paginate ? { page, onPageChange: setPage } : {}),
            sort,
            onSortChange: setSort,
            filterValues: filters,
            onFilterChange: setFilter,
        },
    };
}

export const STATUS_FILTER: TableFilterOption = {
    key: "status",
    label: "Status",
    options: [
        { value: "all", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "suspended", label: "Suspended" },
        { value: "completed", label: "Completed" },
        { value: "inactive", label: "Inactive" },
        { value: "deactivated", label: "Deactivated" },
        { value: "failed", label: "Failed" },
        { value: "rejected", label: "Rejected" },
    ],
};

export const CAMPAIGN_STATUS_FILTER: TableFilterOption = {
    key: "status",
    label: "Status",
    options: [
        { value: "all", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
    ],
};

export const POST_STATUS_FILTER: TableFilterOption = {
    key: "status",
    label: "Status",
    options: [
        { value: "all", label: "All statuses" },
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
    ],
};

export const EVENT_STATUS_FILTER: TableFilterOption = {
    key: "status",
    label: "Status",
    options: [
        { value: "all", label: "All statuses" },
        { value: "upcoming", label: "Upcoming" },
        { value: "ongoing", label: "Ongoing" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ],
};

export const POLL_STATUS_FILTER: TableFilterOption = {
    key: "status",
    label: "Status",
    options: [
        { value: "all", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "draft", label: "Draft" },
    ],
};

export const GENDER_FILTER: TableFilterOption = {
    key: "gender",
    label: "Gender",
    options: [
        { value: "all", label: "All genders" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
    ],
};

export const FAMILY_STATUS_FILTER: TableFilterOption = {
    key: "status",
    label: "Status",
    options: [
        { value: "all", label: "All statuses" },
        { value: "alive", label: "Alive" },
        { value: "deceased", label: "Deceased" },
    ],
};
