# Prompt F2 — catálogo con filtros y ficha de producto

Repo: `hiper-pozuelo-app` (Next.js App Router, TypeScript). Antes de escribir código lee
`docs/design/art-direction.md` §6 y §7 y `docs/design/cro-copy.md` §3. No abras una ronda de preguntas:
si falta un texto, usa el que ya existe en `src/content/` y anótalo en el resumen.

## Contexto

Tienda de cuatro packs de llegada para estudiantes. Sin fotografía: el visual del pack es un panel
tipográfico (`PackPlate`) con el número de artículos. Identidad: fondo cálido, tipografía de sistema
grande, bordes de 1 px, cero sombras, rojo solo en lo accionable.

## Qué construyes

### 1. Catálogo — `app/packs/page.tsx` (reescribir)

- Mantén el buscador que ya existe (parámetro `q`, busca en nombre, beneficio y en todos los ítems).
- Añade **facetas por URL**, todas combinables y con "Limpiar":
  - `cubre`: `bano` | `cocina` | `habitacion`. Un pack cubre `bano` si su slug es `bano` o `completo`;
    `cocina` si es `cocina` o `completo`; `habitacion` si es `habitacion` o `completo`.
  - `precio`: `menos40` (< 40 €) | `40a80` | `mas80`.
  - `orden`: `recomendado` | `precio-asc` | `precio-desc` | `articulos`.
- Los filtros son **chips** (`<a>` con la query ya construida, sin JavaScript) con estado activo
  evidente y el número de resultados. Un chip activo se puede desactivar.
- Muestra `N packs` con el filtro aplicado y un estado vacío con acción "Ver todos".
- Nunca dejes un filtro que devuelva 0 resultados sin salida: el estado vacío siempre ofrece limpiar.
- Cada resultado es una tarjeta: `PackPlate`, nombre, precio, disponibilidad en texto, `PriceLabel`,
  tres ítems reales de `pack.groups[0].items` con su cantidad, "y N más", y botón "Ver pack".

### 2. Ficha — `app/packs/[slug]/page.tsx` (reescribir)

Orden exacto en móvil, todo sobre el pliegue salvo el contenido:

1. `Breadcrumbs`: Inicio / Packs / {nombre}. Enlace, `aria-label="Migas de pan"`, `nav` semántico.
2. Nombre (`h1`) y disponibilidad.
3. **Precio** en `display`, con `PriceLabel` debajo.
4. Línea de beneficio (`pack.benefit`).
5. `PackPlate` tamaño `large`.
6. Botón "Comprar · {precio}" y, debajo, dos líneas de confianza:
   `Recogida en tienda · Gratis` y `14 días para devolverlo`.
7. "Qué entra": un `<details>` abierto por defecto por cada grupo, con `×N` por ítem.
8. "Qué no entra": lista real de `pack.notIncluded`.
9. "Añade otro pack": los otros tres packs como filas con nombre, artículos y precio, enlazando a su ficha.

En escritorio, dos columnas: panel y compra a la izquierda, contenido a la derecha.

**Barra sticky** (`StickyActionBar`) visible a partir de 300 px de scroll en móvil: precio + "Comprar",
altura 56 px, fondo `--surface`, borde superior de 1 px. Se oculta al llegar al bloque de contenido.

## Archivos

Crea en `src/components/`: `Breadcrumbs.tsx`, `PackCard.tsx`, `FilterChip.tsx`, `SortSelect.tsx`,
`ResultsCount.tsx`, `StickyActionBar.tsx`.
Modifica: `app/packs/page.tsx`, `app/packs/[slug]/page.tsx`, `app/globals.css`.

## Prohibido

Tocar `app/api/**`, `src/server/**`, `src/lib/db.ts`, `scripts/**`, `tests/**`, `flow.mjs`,
`packs.generated.json`, precios, `PackPlate.tsx`, `SiteHeader`, `SiteFooter`, `app/page.tsx`.
Ninguna dependencia nueva. No cambies `id` ni `name` de ningún campo de formulario.

## Criterios de aceptación

- Los cuatro filtros funcionan por URL, combinados y con estado vacío con salida.
- Las migas aparecen en la ficha y enlazan a `/` y `/packs`.
- La barra sticky aparece a 390 px tras 300 px de scroll y no tapa el CTA final.
- 0 elementos interactivos por debajo de 44×44 a 390 px. Sin scroll horizontal en 390, 768 y 1280.
- Contraste: cuerpo ≥ 7:1, secundario ≥ 4,5:1.
- `npm run verify` en **0** (pega la salida).
- Capturas: `docs/reviews/f2-packs-390.png`, `f2-ficha-390.png`, `f2-ficha-1280.png`,
  `f2-packs-filtrado-390.png` (con un filtro activo).

Resumen final: archivos tocados, criterios que no pudiste cumplir y por qué.
