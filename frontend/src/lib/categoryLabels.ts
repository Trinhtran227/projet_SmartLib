/**
 * Libellés français pour catégories encore stockées en vietnamien (anciens seeds / BDD).
 * Les noms et slugs déjà en français sont renvoyés tels quels.
 */
const SLUG_TO_FR: Record<string, string> = {
    'khoa-hoc-may-tinh': 'Informatique',
    'toan-hoc': 'Mathématiques',
    'vat-ly': 'Physique',
    'hoa-hoc': 'Chimie',
    'sinh-hoc': 'Biologie',
    'van-hoc': 'Littérature',
    'lich-su': 'Histoire',
    'dia-ly': 'Géographie',
    'kinh-te': 'Économie',
    'tam-ly-hoc': 'Psychologie',
    'triet-hoc': 'Philosophie',
    'kinh-doanh': 'Commerce',
};

/** Noms exacts tels qu’en base (seed vietnamien historique) */
const NAME_TO_FR: Record<string, string> = {
    'Khoa Học Máy Tính': 'Informatique',
    'Toán Học': 'Mathématiques',
    'Vật Lý': 'Physique',
    'Hóa Học': 'Chimie',
    'Sinh Học': 'Biologie',
    'Văn Học': 'Littérature',
    'Lịch Sử': 'Histoire',
    'Địa Lý': 'Géographie',
    'Kinh Tế': 'Économie',
    'Tâm Lý Học': 'Psychologie',
    'Triết Học': 'Philosophie',
    'Kinh Doanh': 'Commerce',
    'Tất cả các danh mục': 'Toutes les catégories',
    'Tất cả thể loại': 'Toutes les catégories',
};

export function getCategoryDisplayName(cat: { name?: string; slug?: string } | null | undefined): string {
    if (!cat) return '';
    const slug = (cat.slug || '').toLowerCase().trim();
    if (slug && SLUG_TO_FR[slug]) return SLUG_TO_FR[slug];
    const name = (cat.name || '').trim();
    if (name && NAME_TO_FR[name]) return NAME_TO_FR[name];
    return name;
}

export function getCategoryDisplayNameFromName(name: string | undefined | null): string {
    if (name == null || name === '') return '';
    const t = name.trim();
    if (NAME_TO_FR[t]) return NAME_TO_FR[t];
    return t;
}
