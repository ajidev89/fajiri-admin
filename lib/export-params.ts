export function exportParams(params: Record<string, string> = {}) {
    const next = { ...params };
    delete next.page;
    delete next.per_page;
    return next;
}
