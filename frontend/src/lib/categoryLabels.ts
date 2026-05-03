/**
 * Legacy category display helper.
 * Kept for backward compatibility in UI.
 */

export function getCategoryDisplayName(cat?: { name?: string; slug?: string }) {
    return cat?.name?.trim() ?? '';
}

export function getCategoryDisplayNameFromName(name?: string | null) {
    return name?.trim() ?? '';
}