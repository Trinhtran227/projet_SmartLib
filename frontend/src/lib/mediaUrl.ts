/**
 * Origine du backend (sans /api) pour les chemins relatifs /uploads/...
 * Par défaut : même port que backend/server.js et backend/.env (PORT, souvent 2409).
 * Sur un autre port : définir REACT_APP_API_URL (ex. http://localhost:5000/api).
 */
export function getApiOrigin(): string {
    const raw = process.env.REACT_APP_API_URL || 'http://localhost:2409/api';
    const trimmed = raw.replace(/\/+$/, '');
    const withoutApi = trimmed.replace(/\/?api$/i, '');
    return withoutApi || 'http://localhost:2409';
}

export const defaultApiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:2409/api';

/** Chemin relatif ou URL absolue → URL utilisable par <img src> */
export function resolveMediaUrl(pathOrUrl: string | undefined | null): string {
    if (!pathOrUrl) return '';
    const s = pathOrUrl.trim();
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    const origin = getApiOrigin();
    return `${origin}${s.startsWith('/') ? '' : '/'}${s}`;
}
