# Prompt 4 · Fase F1 — chrome y portada

Pega este bloque completo en Codex. Repo: `hiper-pozuelo-app` (Next.js App Router, TypeScript strict). Una fase: banda, cabecera, pie y la portada completa. No abras catálogo, ficha, carrito ni checkout.

## Qué construyes

Tienda de packs de llegada para estudiantes, en español, **sin fotografía**. Identidad: almacén ordenado, fondo cálido, tipografía de sistema grande, cero sombras, rojo solo donde se gasta dinero. La foto se sustituye por un panel tipográfico, `Pack Plate`.

## Documentos obligatorios — léelos antes de escribir una línea

Están en el repo, en `docs/design/`. Léelos en este orden y **no los edites**:

1. `docs/design/cro-copy.md` — qué dice cada bloque y con qué texto exacto.
2. `docs/design/art-direction.md` — cómo se compone: retícula, tipografía, color, movimiento.
3. `docs/design/implementation.md` — qué archivos, qué componentes, qué no se toca.
4. `docs/design/acceptance.md` — qué se te va a medir para aprobar la fase.

**Precedencia si discrepan:** copy > arte > implementación > aceptación. No preguntes, no inventes,
no abras una ronda de dudas: aplica ese orden y anótalo en el resumen final.

## Números que no puedes cambiar

Estos están aquí para que no tengas que interpretarlos. Si un valor no aparece, sale de
`art-direction.md`; si tampoco está allí, usa el token más cercano de `globals.css`.

| Qué | Valor |
|---|---|
| Retícula | 12 columnas · márgenes y gutter 16 / 24 / 32 px a 390 / 768 / 1280 · contenedor máx 1200 |
| `display` | 30/36 · 34/41 · 40/46 px · peso 700 · tracking -0.01em |
| `h1` | 26/32 · 28/34 · 32/38 · 700 |
| `h2` | 20/26 · 22/28 · 600 · `h3` 17/24 · 600 |
| `body` / `small` / `micro` | 16/24 · 14/20 · 12/16 (micro en mayúsculas, tracking +0.12em) |
| Cifras | `font-variant-numeric: tabular-nums` en **todo** precio, contador y número de artículos |
| Espaciado | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px. Nada fuera de esa escala |
| Bordes | 1 px `var(--line)`. **Cero sombras** salvo la barra sticky. Radios 6 / 10 / 16 / 999 |
| Color | 60 % fondo cálido · 30 % blanco y tinta · 10 % líneas **y rojo**. El rojo solo en: CTA primario, barra sticky, paso activo, wordmark |
| Movimiento | 120 ms hover/foco · 160 ms cambio de estado · `cubic-bezier(.2,0,.3,1)` · solo `opacity`, `transform` ≤4 px, `background-color`, `border-color` |
| `prefers-reduced-motion` | Sin transform ni transición: el estado cambia seco |
| Aceptación | tinta ≥18 % en la primera pantalla · ≥3 bloques a 390 y ≥5 a 1280 · 0 elementos <44×44 · contraste cuerpo ≥7:1, secundario ≥4,5:1, UI ≥3:1 · CLS 0 |

## Alcance de esta fase

F1 entrega **la banda, la cabecera, el pie y la portada**. No entrega el sitio: el catálogo y la ficha
son F2, el carrito y el checkout visual son F3, y el sistema aplicado con ES/EN, JSON-LD y sitemap es
F4. No adelantes trabajo de F2–F4 ni dejes la Home a medias para empezar otra pantalla.

## Archivos

Crea:

- `src/components/SiteDisclosureBand.tsx` — una línea, sticky, primer hijo del body; el texto sale de `src/content/disclosure.ts`.
- `src/components/HeaderSearch.tsx` — `<form action="/packs" method="get">` con `<input name="q">`. Sin JS.
- `src/components/CartBadge.tsx` — cliente; lee `localStorage['cart']`. Reserva 24 px fijos y `tabular-nums`: 0→N no puede mover el layout.
- `src/components/PackPlate.tsx` — panel 4:3, borde 1 px, número de artículos en grande, nombre debajo. Props `{name, units, price?, size}`.

Modifica:

- `app/layout.tsx` — la banda como primer hijo. No toques `metadata`.
- `src/components/SiteHeader.tsx` — marca, los cuatro packs como navegación, buscador, carrito.
- `src/components/SiteFooter.tsx` — cuatro columnas y la línea de no afiliación entera, sin truncar.
- `app/page.tsx` — la portada, con los once bloques de abajo.
- `app/globals.css` — un archivo, secciones comentadas, techo 30 KB; `.availability[...]` se queda textualmente donde está.

No toques: `app/api/**`, `src/server/**`, `src/lib/db.ts`, `scripts/**`, `tests/**`, `src/components/PackCover.tsx` (la ficha lo importa; se retira en F2), `packs.generated.json`, ningún precio, ninguna cadena aprobada.

## La portada: once bloques, en este orden

Cada bloque es `<section data-block="...">`. El orden es la decisión.

0. Banda sticky.
1. Cabecera: marca + cuatro packs + buscador + carrito.
2. Hook: H1, sublínea, CTA primario, CTA secundario (ancla al bloque 7).
3. Fila de confianza, tres ítems.
4. Los cuatro packs: nombre, `{n} artículos`, precio, disponibilidad en texto, `PackPlate`.
5. `Qué entra` — los `×N` por pack: la prueba que sustituye a la foto.
6. `Qué cubre cada pack` — comparación de datos: artículos, grupos, precio, qué no entra.
7. `Cómo funciona` — tres pasos numerados.
8. `Dónde lo recoges` — tienda y recogida.
9. `Dudas antes de comprar`.
10. Cierre: frase + CTA repetido + pie.

`art-direction.md` §6 lista 7 bloques e `implementation.md` §2 dice 10: manda `cro-copy.md` §1, con 11.

Sin scroll a 390 px: bloques 0–4, con la primera tarjeta asomando. Un solo botón primario por pantalla.

## Textos exactos

Carácter por carácter:

- H1: `Cuatro packs para tu primer día de piso.`
- Sub: `Mira qué entra, cuánto cuesta y cuándo lo recoges.`
- CTA: `Ver los 4 packs` · `Cómo funciona`
- Etiquetas: `Packs para estudiantes` · `Qué entra` · `Qué cubre cada pack` · `Dónde lo recoges` · `Dudas antes de comprar`
- Tarjeta: `Disponible` · `Últimas unidades` · `Agotado` · `22 artículos`
- Precio y confianza: `Precio de demostración · IVA incluido` · `Recogida en tienda · Gratis` · `Recogida en tienda. Sin envíos.` · `Pago simulado, sin cargo`
- Devolución: `Tu derecho a devolverlo` · `14 días desde la recogida.`
- Cierre: `Vas a ver todo lo que entra antes de pagar.` + `Ver los 4 packs`

**Prohibido inventar copy.** Si falta una palabra —títulos de los tres pasos, ítems de dudas, encabezados de la comparación— escribe la estructura y deja `<!-- PENDIENTE @marketing -->`; nómbralo en el resumen. Nada de sinónimos, `de prueba`, reseñas, estrellas, urgencia, envío a domicilio, descuentos ni superlativos.

## Cierre

- `npm run verify` debe salir 0. Pega la salida.
- Adjunta capturas a 390, 768 y 1280 guardadas en `docs/reviews/f1-*.png`.
- Resume archivos tocados y todo lo `PENDIENTE @marketing`.

## Anexo — fases siguientes (no las ejecutes)

- **F2 — catálogo y ficha.** Filtros, orden, vista rápida y breadcrumbs en `/packs`; ficha con above-the-fold, sticky y cross-sell. Aceptación: `F2-1`…`F2-5` verdes en capturas; aquí se retira `PackCover`.
- **F3 — carrito y checkout visual.** Drawer, resumen, confianza; POST y payload intactos. Aceptación: `F3-1`…`F3-3`.
- **F4 — sistema aplicado.** 24 componentes × 5 estados, `prefers-reduced-motion`, ES/EN, JSON-LD y sitemap. Aceptación: `F4-1`…`F4-4`.

## Anexo B — 3D: opción B de Simon (piloto, **después** de F1)

Decisión del propietario: se prueba 3D, pero **no dentro de F1**. F1 entrega el `Pack Plate` tipográfico. Cuando F1 esté aprobada, se ejecuta esta tarea aparte, una sola vez.

- **Qué se dibuja:** una ilustración isométrica por pack — una caja de mudanza abierta con el nombre y el número de artículos, no los 99 objetos. Estilo plano, dos tonos de la paleta, sombra única.
- **Cómo:** SVG propio escrito a mano o generado en `scripts/` con `sharp` (ya es dependencia) a AVIF. **Sin** three.js, sin canvas, sin WebGL, sin animación.
- **Límites:** SVG ≤ 6 KB inline, o AVIF ≤ 60 KB con `width`/`height` explícitos y `loading="lazy"` solo por debajo del pliegue. CLS 0.
- **Regla de salida, sin discusión:** se compara contra el `Pack Plate` en captura a 390 y 1280. Si no gana con claridad, se descarta y se queda el plate. **Un intento.** No hay ronda 2.
- **Prohibido:** imágenes de stock, renders de los 52 objetos, animar el render, pedir una dependencia nueva.

