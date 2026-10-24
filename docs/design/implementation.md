# Implementación de front — especificación para Codex

@developer · `PROPOSED` · encargo `DECIDED` (`brief-rediseno-front.md`). Fuentes: `art-direction.md` §5–§7,
`cro-copy.md` §1. Medido en `hiper-pozuelo-app@6be5d21` tras `npm run build`. Sin deps nuevas; nada se
implementa esta ronda.

## 1. Estilos: un solo `app/globals.css`, sin CSS Modules

`DECIDED` (técnica). `tests/availability.test.mjs:26-38` lee `app/globals.css` buscando
`.availability[data-availability="in_stock|low_stock|sold_out"]` y lee `app/page.tsx` +
`app/packs/[slug]/page.tsx` buscando `className="availability" data-availability={p.availability}`: los
módulos ponen `verify` en rojo por diseño. Coste de migrar: 13 rutas, 8 componentes, ~70 clases, ~2 días, dos
tests fuente reescritos; riesgo alto. Regla: secciones, techo 30 KB raw (hoy 17.876 B); si lo pasa, `@import`
por ruta, y `.availability[…]` sigue literal.

## 2. Plan de archivos

| Fase | Crea | Modifica | Borra |
|---|---|---|---|
| F1 | `SiteDisclosureBand` `HeaderSearch` `CartBadge` `PackPlate`, `scripts/perf.mjs` | `app/layout.tsx`, `app/page.tsx`, `SiteHeader`, `SiteFooter`, `globals.css` | `PackCover.tsx` |
| F2 | `Breadcrumbs` `FilterGroup` `SortSelect` `ResultsCount` `PackCard` `Badge` `PriceLabel` `QuickView` `StickyActionBar`, `src/content/groups.ts` `src/content/facets.ts` | `app/packs/page.tsx`, `app/packs/[slug]/page.tsx`, `globals.css` | — |
| F3 | `QuantityStepper` `CartDrawer` `AddOnRow` `SummaryPanel` `StepHeader` `SlotDayChip` `SimulatedPaymentPanel` | `app/carrito/page.tsx`, `app/checkout/page.tsx`, `AddToCartButton`, `Alert`, `globals.css` | — |
| F4 | `src/content/copy.ts` (+`copy.en.ts`), `JsonLd`, `app/sitemap.ts` | `app/layout.tsx`, `app/robots.ts`, `globals.css` | — |

Nombre suelto = `src/components/<Nombre>.tsx`. `flow.mjs` intacto.

## 3. Inventario: 24 piezas, 27 archivos, 5 ya existen

Regla: repetido en ≥2 rutas o con estado → componente; el resto, inline. **Negrita = existe y se refactoriza**;
`PackPlate` absorbe a `PackCover`; `Button`/`Wordmark` son CSS.

| # | Archivo (`src/components/`) | Props mínimas | c |
|---|---|---|---|
| 1 | `SiteDisclosureBand` | `{}` | — |
| 2 | **`SiteHeader`** | `{}` | — |
| 3 | `HeaderSearch` | `{defaultValue?}`, form GET | — |
| 4 | `CartBadge` | `{}`, 24 px fijos | sí |
| 5 | **`SiteFooter`** | `{}` | — |
| 6 | `PackPlate` | `{name, units, price?, size}` | — |
| 7 | `Breadcrumbs` | `{trail}` | — |
| 8 | `FilterGroup` | `{options, active, base}` | — |
| 9 | `SortSelect`·`ResultsCount` | `{value,options}`·`{count,q?}` | — |
| 10 | `PackCard` | `{p}`, solo PLP | — |
| 11 | `Badge` | `{availability}` | — |
| 12 | `PriceLabel`+`ProvenanceNote` | `{dataStatus}` | — |
| 13 | **`ContentsGroup`** | `{name, units, items}` | — |
| 14 | `QuickView` | `{p}`, `<dialog>` | sí |
| 15 | `StickyActionBar` | `{slug, price, label}` | sí |
| 16 | **`AddToCartButton`** | `{slug, price}` | sí |
| 17 | `QuantityStepper` | `{qty, max, onChange}` | sí |
| 18 | `CartDrawer` | `{}`, `<dialog>` | sí |
| 19 | `AddOnRow` | `{slug, price}` | sí |
| 20 | `SummaryPanel` | `{subtotal, total}` | — |
| 21 | `StepHeader` | `{steps, current}` | — |
| 22 | `SlotDayChip`+`SlotWindowCard` | del padre, sin aforo | — |
| 23 | `SimulatedPaymentPanel` | `{total}` | sí |
| 24 | **`Alert`** | `{kind, title}` | — |

`c` = `'use client'` (8 de 24); el resto, servidor.

## 4. Datos: qué falta y cómo se deriva sin tocar backend ni esquema

| Necesita el front | Derivación |
|---|---|
| Etiqueta de grupo | `content/groups.ts`: mapa + `groupLabel()` que **lanza** si falta |
| Facetas de PLP | `content/facets.ts` en render. **Medido: cada uno de los 6 grupos aparece en 2 packs**: contador constante; el filtro útil es `q` |
| "y N más" | `units`; 65 filas, 35 ítems únicos, 6 con `×N` (Vaso ×4, Percha ×10) |
| Comparación | 9/22/16/52 unidades · 1/4/1/6 grupos · `notIncluded` 6/6/6/**0** → el completo pinta fila vacía |
| Contador de carrito | `localStorage['cart']` = `{slug:qty}`, techo 5/línea |
| i18n EN (F4) | `copy.ts` ES por defecto; `/en` solo Home, PLP y PDP |
| `Últimas unidades` | **no derivable**: `build-content.mjs` fija `in_stock`; sigue `OPEN` |

Prohibido en el JSON: `verify.mjs:6` exige `length===4` y `refs/units` = `9/9 · 14/22 · 7/16 · 35/52`.

## 5. 3D: de acuerdo en descartarlo

Por coste de geometría antes que de peso: **35 ítems únicos y 99 unidades** pedirían malla, material y luz
propios; no cito el peso de three.js: no lo he medido. El presupuesto ya está gastado:
**179.407 B gzip de JS inicial**; WebGL lo duplica y mueve el LCP a GPU. Sustituto:
(1) el `Pack Plate` de art §5 (0 KB, 0 peticiones, CLS 0) es el defecto; (2) si Simon quiere profundidad,
extender `scripts/make-pack-art.mjs` (**`sharp` ya es dependencia**) para rasterizar una pieza isométrica SVG
a WebP 1200×900 (<60 KB), y las 4 existentes como miniatura 120×90: 1 paso de build, 1 petición, `width` y
`height`, CLS 0. Si a 390/768/1280 no supera al plate, se descarta sin reauditoría.

## 6. Presupuesto y medición por fase

Baseline medido:

| Métrica | Hoy, medido | F1/F2 | F3/F4 | Método |
|---|---|---|---|---|
| JS inicial | 9 pet. · 579.152 B raw · **179.407 B gz** | ≤189 KB gz | ≤194 KB gz | `node scripts/perf.mjs` |
| CSS | 17.876 B raw · 4.403 B gz | ≤6 KB gz | ≤8 KB gz | idem |
| HTML | 4.428 B gz | ≤6 KB gz | ≤8 KB gz | idem |
| Peticiones | 11 (HTML+9 JS+CSS); PDP 10 | ≤13 | ≤13 | idem |
| LCP 4G móvil | no medido | <2,0 s | <2,0 s | CDP con throttle, 390×844 DPR 2 |
| CLS | no medido | **0,00** | **0,00** | `layout-shift`, umbral 0 |

`scripts/perf.mjs` (nuevo, sin deps) suma `gzip -c` de los chunks de `.next/server/app/*.html`, cuenta
peticiones y **sale 1** si pasa el techo; corre antes de `verify`. LCP y CLS los mide @auditor con captura.

## 7. Riesgos y qué no se toca

| P | Riesgo | Mitigación |
|---|---|---|
| Alta | `availability.test.mjs` en rojo al componentizar tarjetas | `page.tsx` y `packs/[slug]/page.tsx` conservan ese `<span>` literal |
| Alta | `verify.mjs:7` escanea todo `.ts/.tsx/.css` buscando tres frases de copy prohibido | copy solo de `cro-copy.md` |
| Alta | Badge 0→48 px = CLS | 24 px reservados |
| Media | Reescribir el checkout repite D1–D6 de `ux-m4-visual-delta.md` | solo presentación, POST intacto |
| Media | CSS único >30 KB raw | `perf.mjs` como puerta |
| Baja | `/en` duplicando rutas | `flow.mjs` pide `/packs/bano`, `/pedido/[token]`, `/api/**` |

No se toca: `app/api/**`, `src/server/orders.ts`, `src/lib/db.ts`, `src/lib/{cart,lines,hold,slots}.ts`,
`src/content/{price,availability,capacity,disclosure,store}.ts`, `scripts/{flow,verify,build-content}.mjs`,
`data/pack-price-sheet.csv` + `canonical.sha256`, `app/pedido/[token]/page.tsx` y el `metadata` de `layout.tsx`.

## Choques

- art §6 da Home en 5 bloques y cro §1 en 10: implemento los 10; "sin scroll" solo en los 4 primeros; decide @director.
- art §7 pide contador en los chips y cada grupo da 2 packs (medido): lo muestro igual.
- `public/packs/*.webp` no se puede borrar aunque quede sin uso (`verify.mjs:5`).

---

> **Nota de operador (por encargo de Simon, 2026-10-24) — congelado.** Donde este documento y
> `cro-copy.md` §1 discrepen en el número de bloques de la Home, **manda `cro-copy.md`: 11 bloques**,
> y el ejecutable es `docs/prompts/prompt-4-front-1.md`. El recuento de este documento queda como
> referencia de composición, no como alcance. `PackCover.tsx` no se retira hasta F2 (la ficha aún lo
> importa). No se reabre: D-067.
