export const PROVENANCE_NOTE='Demo: contenido e imagen de ejemplo.';
export const AFFILIATION_LINE={none:'Demostración académica. No somos la tienda.'} as const;
export const FOOTER_DISCLOSURE=`${AFFILIATION_LINE.none} ${PROVENANCE_NOTE}`;
export const FRAME_LEAD=`${AFFILIATION_LINE.none.split('. ')[0]}.`;
