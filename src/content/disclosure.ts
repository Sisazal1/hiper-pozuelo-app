export const PROVENANCE_NOTE='Demo: contenido e imagen de ejemplo.';
export const AFFILIATION_LINE={none:'Demostración académica. No somos la tienda.'} as const;
export const FOOTER_DISCLOSURE=`${AFFILIATION_LINE.none} ${PROVENANCE_NOTE}`;
export const FRAME_LEAD=`${AFFILIATION_LINE.none.split('. ')[0]}.`;
// brand-guidelines.md §4.9.1 — 641 characters, measured. The only analytics text on the site;
// it becomes false the day a cookie, a third party or a PII field ships (D-061 closes Q3's copy half).
export const ANALYTICS_MEASUREMENT='Para saber qué packs se miran y dónde se abandona una compra, registramos en nuestro propio servidor diez eventos: ver un pack, añadirlo al carrito, quitarlo, empezar la compra, el paso del formulario en el que estás, la franja elegida, el pago, un pago fallido, la recogida y el origen de la visita. Cada evento lleva un identificador aleatorio que se genera en tu navegador al abrir la página y desaparece al cerrarla: no te identifica, no se comparte y no se cruza con tu nombre, tu teléfono ni tu pedido. No usamos cookies, ni analítica de terceros, ni publicidad. Tu nombre y tu teléfono se usan solo para preparar y entregar el pedido.';
