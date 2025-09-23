/**
 * Validates if a string is a valid config ID format
 * Backend generates UUIDs, so we accept any non-empty string
 */
export const isValidConfigId = (id: string): boolean => {
    return Boolean(id && id.length > 0 && !id.includes('/'));
};

/**
 * Extracts config ID from URL path
 */
export const extractConfigIdFromPath = (pathname: string): string | null => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1 && isValidConfigId(segments[0])) {
        return segments[0];
    }
    return null;
};
