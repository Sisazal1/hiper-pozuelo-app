# Dirección de arte — Hiper Pozuelo

@uxdesigner · `PROPOSED` · `DECIDED` el encargo (`brief-rediseno-front.md`) · tokens: `design-system.md` §2/§4/§5 · copy: @marketing · sin fotos, sin backend.

## 1. En una frase

**Un almacén ordenado, no una tienda:** papel cálido, tipografía de sistema a tamaño de cartel y un
rojo que solo aparece cuando se gasta dinero.

| Decisión | Se reconoce porque |
|---|---|
| Tipografía | salto 40 → 16 px, sin nivel intermedio; cifras tabulares |
| Escala | tarjetas de borde 1 px `--line`, cero sombras, bloques a 32/48 |
| Superficie | página entera `--surface-warm`; blanco solo en lo accionable |

## 2. Retícula

12 columnas `1fr` · contenedor 1200 · gutter y margen por token (DS §4/§6).

| bp | margen | gutter | packs | PDP |
|---|---|---|---|---|
| 390 | 16 | 16 | 2×, gap 12 | 1 columna |
| 768 | 24 | 24 | 2×, gap 24 | 1 columna, texto 34em |
| 1280 | auto | 32 | 4×, gap 32 | 7/5 (plate · ficha) |

## 3. Tipografía

System stack, sin webfont (DS §3). Tracking: `display` −0.01em, `micro` +0.02em, `code` +0.12em,
resto 0. `tabular-nums` en precios y contadores.

| Token | 390 | 768 | 1280 | Peso | Dónde |
|---|---|---|---|---|---|
| `display` | 30/36 | 34/41 | 40/46 | 700 | H1 Home · precio PDP |
| `h1` | 26/32 | 28/34 | 32/38 | 700 | títulos · nombre de pack |
| `h2` | 20/26 | 20/26 | 22/28 | 600 | sección |
| `h3` | 17/24 | 17/24 | 17/24 | 600 | grupo · tarjeta |
| `body` | 16/24 | 16/24 | 16/24 | 400 | prosa · item · label |
| `small` | 14/20 | 14/20 | 14/20 | 400 | meta · `PriceLabel` |
| `micro` | 12/16 | 12/16 | 12/16 | 500 mayús | badge · paso · ref. |
| `note` | 12/16 | 12/16 | 12/16 | 400 | provenance · banda |
| `code` | 44/52 | 44/52 | 44/52 | 700 | código |

En PDP el precio (`display`) va sobre el nombre (`h1`): jerarquía de P2.

## 4. Color: 60/30/10

| % | Qué | Dónde |
|---|---|---|
| 60 | `--surface-warm` | página, banda, plate, huecos de rejilla |
| 30 | `--surface` + `--ink`/`--ink-secondary` | tarjetas, inputs, cabecera, todo el texto |
| 10 | `--line`/`--line-strong` + `--red-action` | bordes, steppers y el rojo |

Rojo en cuatro sitios: CTA primario, `StickyActionBar`, paso activo del `StepHeader`, wordmark ≥24 px
(`--red-brand`). Nunca en badges, enlaces ni decoración (DS §1.2).

## 5. 3D: descartado

| Motivo | Consecuencia |
|---|---|
| 99 artículos reconocibles: geometría, material y luz creíbles para 99 objetos no existen a este presupuesto; el brief §2.1 prohíbe el 3D mediocre | fuera |
| WebGL suma JS y GPU contra LCP < 2,0 s en 4G (brief §2.4) | fuera |
| el producto es la lista de contenido (P1) | un pack girando no dice cuántos platos trae |

**Sustituto: `Pack Plate`.** Panel 4:3 en `--surface-warm`, borde 1 px: número de artículos en
`display` tabular (16 · 22 · 9 · 52), grupo en `micro` encima, nombre en `h3`, precio y badge, reglas
de 1 px entre grupos como un albarán. 0 KB, 0 JS, LCP de texto, CLS 0, sin red. Coste: todo el peso
visual es tipográfico. Se reabre solo con un render propio estático (AVIF < 60 KB, sin canvas) y test
de LCP.

## 6. Blueprint (390 × 844; en las cuatro: banda · cabecera = 80 px)

| Pantalla | Bloques en orden | Sin scroll |
|---|---|---|
| Home | H1 display + sublínea + CTA `Ver los 4 packs` (48) · confianza ×3 · rejilla 2×2 · "Cómo funciona" ×3 · pie | H1, sublínea, CTA y confianza; asoma la 1.ª tarjeta |
| PLP | H1 + `4 packs · desde 32,90 €` · chips de grupo · orden · recuento · 4 filas (plate 120×90, nombre, `N artículos`, 3 items + "y N más", precio, `ProvenanceNote`) · pie | H1, recuento, chips, orden, 1.ª fila entera |
| PDP | volver · H1 · badge · precio + `PriceLabel` · beneficio · `Pack Plate` · `<details>` · "No incluye" · sticky | hasta el plate; la 1.ª cabecera de grupo a ras del borde |
| Carrito | H1 `Tu pedido` · líneas (plate 64×48, nombre, `N artículos`, stepper, total, `Quitar`) · `AddOnRow` · resumen (subtotal · `Recogida en tienda · Gratis` · total + `PriceLabel`) · `Continuar · {total}` · `Añadir otro pack` · pie | título, 1.ª línea, resumen y CTA; con 2 líneas, scroll corto |
| Checkout | `StepHeader` · chips de día · ventanas · nombre · teléfono · `Continuar al pago · {total}` | paso, chips, 1.ª ventana |

Un primario por pantalla y un número visible.

## 7. Componentes

Todos: default · hover · `focus-visible` 2px `#1A1A1A` · active · disabled con razón. Solo excepciones:

| Componente | Estados propios |
|---|---|
| `Button` | loading · error |
| `PackCard` | normal · últimas · agotado ("Ver otro pack") · sin plate |
| `PackPlate` | 1 · 2–6 grupos · 120×90 · 64×48 |
| `Badge` | disponible · últimas · agotado |
| `FilterChip` / `FilterGroup` | off · on · on+contador · disabled · abierto · limpiar |
| `SortSelect` / `ResultsCount` | nativo, 4 opciones · con filtros · sin · 0 |
| `EmptyState` | sin resultados (limpiar) · carrito vacío |
| `QuantityStepper` | 1 (menos off) · N (más off) · loading |
| `ContentsGroup` | cerrado · abierto · print abierto |
| `PriceLabel` / `ProvenanceNote` | A (37) · B (27) · sin `data_status` no renderiza |
| `Wordmark` / `SiteDisclosureBand` | pantalla · print negro · banda 1 línea, 2 a 200 % |
| `Header` | badge 0 · badge N · sticky |
| `StickyActionBar` | visible · print oculto · sin stock |
| `AddOnRow` | default · loading · added (desaparece) · undone · error · offline |
| `SlotDayChip` | libre · sel. · completo · sin capacidad |
| `SlotWindowCard` | libre · sel. · `Quedan N` (≤2) · completo |
| `StepHeader` | paso 1 · 2 · 3 (activo rojo) |
| `SimulatedPaymentPanel` | default · enviando · fallido |
| `Alert` | info · success · warning · error (`role="alert"`) |
| `PickupCode` | normal · copiado · print 40 pt |

## 8. Movimiento

`opacity`, `transform` ≤4 px, `background-color`, `border-color`. 120 ms hover/foco, 160 ms cambio de
estado, `cubic-bezier(.2,0,.3,1)`; nada por encima de 160 ms. Con `prefers-reduced-motion: reduce`,
duración 0 y sin transform.

Alcance: hover/foco (solo color) · chip de filtro · `<details>` · toast `Deshacer` · sheet (opacidad)
· cambio de paso · `Añadiendo…` · "Copiado".

Prohibido: bucles, parallax, shimmer, contadores, scroll revelado.

## Choques

- **PLP con filtros** (brief §2) choca con `ux-principles.md` §3.1 y D-002: se especifica por instrucción directa, con filtros de `group` que nunca dan cero resultados; decide @director.
- **`Pack Plate` en el hueco 4:3** choca con D-033 §4.12.1: la ilustración `.webp` quedaría como miniatura; decide @director.

---

> **Nota de operador (por encargo de Simon, 2026-10-24) — congelado.** Donde este documento y
> `cro-copy.md` §1 discrepen en el número de bloques de la Home, **manda `cro-copy.md`: 11 bloques**,
> y el ejecutable es `docs/prompts/prompt-4-front-1.md`. El recuento de este documento queda como
> referencia de composición, no como alcance. `PackCover.tsx` no se retira hasta F2 (la ficha aún lo
> importa). No se reabre: D-067.
