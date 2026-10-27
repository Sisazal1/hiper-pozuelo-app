# Criterios de aceptación — rediseño front · congelados antes de construir

**Owner:** @auditor · **Ronda:** `brief-rediseno-front.md` (2026-10-24)
`DECIDED` = citado del brief (§2/§5). `PROPOSED` = umbral mío, lo confirma @director en una línea.
**Baselines `OPEN`**: se miden en la primera captura de la fase y se escriben en su veredicto.
Sin cambio de alcance: fases y dueños, brief §5.

## 1. Contrato de captura

`V` = existe un PNG en `docs/audits/captures/` llamado `<fase>-<id>-<ancho>-<sha>.png` (sha del
árbol auditado), DPR 1, a **390×844**, **768×1024** y **1280×800**, más `metrics.json` de la sonda
de §3. Sin sha, ruta y ancho no es evidencia.

## 2. Checklist fotografiable

**F1 — chrome y Home** (`[data-block]`)

| ID | Captura | Ancho | Pasa si |
|---|---|---|---|
| F1-1 | `/` arriba | 390 | buscador ≥ 160×44 px + carrito con número (0 cuenta); ≥ 3 bloques en cuadro |
| F1-2 | `/` arriba | 1280 | ≥ 5 bloques; ≥ 1 visual (`Pack Plate` o SVG ≥ 240×160); un solo botón primario (C4) |
| F1-3 | `/` completa | 768 | ≥ 9 bloques; pie de 4 columnas y línea de no afiliación entera, sin `clamp` |
| F1-4 | 8 componentes F1 × 5 estados, hoja de contacto | 390 | 40 celdas; hover/active/focus-visible difieren del default ≥ 1 % de píxeles |

**F2 — PLP y ficha**

| ID | Captura | Ancho | Pasa si |
|---|---|---|---|
| F2-1 | `/packs` | 390 | breadcrumb ≥ 2 niveles, orden, chips, ≥ 6 tarjetas en 2 pantallas, cada una con nombre + precio + disponibilidad en texto (C9) |
| F2-2 | `/packs/[slug]` sin scroll | 390 | h1, precio, `PriceLabel`, disponibilidad, CTA y plate dentro de 844 px |
| F2-3 | misma, scroll 1 200 px | 390 | sticky con precio y CTA, sin tapar el `safe-area-inset` |
| F2-4 | `/packs/[slug]` | 1280 | plate ≥ 480×360 + ≥ 3 bloques debajo (qué entra, qué no, cross-sell) |
| F2-5 | PLP con 0 resultados | 390 | frase, CTA de recuperación, sin rejilla vacía |

**F3 — carrito y checkout (solo visual)**

| ID | Captura | Ancho | Pasa si |
|---|---|---|---|
| F3-1 | drawer cerrado / abierto / foco atrapado | 390 | abre en ≤ 300 ms (medido); `Total` con la etiqueta D-042 debajo |
| F3-2 | paso 1, válido y error | 390 | todo input ≥ 44×44 con borde ≥ 1 px a ≥ 3:1 (el fallo B-1, D-061); el error imprime mensaje **y** salida |
| F3-3 | checkout | 768 / 1280 | dos columnas, resumen sticky, ≥ 2 bloques de confianza, sin overflow (C7) |

**F4 — sistema aplicado**

| ID | Captura | Ancho | Pasa si |
|---|---|---|---|
| F4-1 | todos los componentes × 5 estados | 390 | ≥ 24 componentes, 0 celdas vacías frente a art-direction §7 (C11) |
| F4-2 | una transición, 2 fotogramas ≥ 100 ms | 390 | difieren; con `prefers-reduced-motion: reduce` son idénticos |
| F4-3 | pareja ES/EN por ruta | 390 + 1280 | sin overflow, sin string sin traducir, sin bloque mezclado |
| F4-4 | `/sitemap.xml` y JSON-LD en Rich Results | — | todas las rutas; captura del validador |

## 3. Umbrales objetivos

| Métrica | Umbral | Instrumento |
|---|---|---|
| Contraste | cuerpo ≥ 7:1, secundario/grande ≥ 4.5:1, UI no textual y anillo de foco ≥ 3:1, axe `color-contrast` 0 | axe 4.10 + tokens |
| Táctil | 0 elementos < 44×44 CSS a 390, ≥ 8 px de separación `DECIDED` (§2.3) | barrido `getBoundingClientRect()` |
| LCP | ≤ 2,0 s móvil 4G, 3 pasadas, mediana `DECIDED` (§2.4) | JSON de Lighthouse |
| CLS | 0,00 `DECIDED` (§2.4) · INP ≤ 200 ms `PROPOSED` | Lighthouse + web-vitals |
| Bloques/pantalla | ≥ 3 a 390, ≥ 5 a 1280; ninguno > 1,6 pantallas `PROPOSED` | cajas `[data-block]` |
| Estados | ≥ 24 componentes con default/hover/active/focus/disabled `PROPOSED` | tabla vs hoja |
| Jerarquía | ≥ 3 niveles `--text-*` en la primera pantalla, ≤ 5 por página, un `h1`, sin saltos `PROPOSED` (C2, C5) | estilo computado + axe |
| Densidad | ratio de tinta ≥ 18 % en la primera pantalla, ≥ 25 % en página completa a 390 `PROPOSED` | conteo de píxeles (§4) |

## 4. Detectar un sitio "vacío"

Píxeles ≠ fondo (ΔE > 10) ÷ píxeles de pantalla = **ratio de tinta**. Por pantalla de scroll a 390:
≥ 45 elementos de contenido (cajas de bloque con texto o media) y ≥ 1 visual cada 1,5 pantallas.
Fallar una de las tres = **vacío** y la fase no pasa; igual a 1280. El ratio del árbol actual es
`OPEN`: la base a batir, medida en el veredicto de F1.

## 5. Regla anti-bucle

Un prompt por fase, **una sola reauditoría por fase**, sin excepciones. Un hallazgo fuera del prompt
de esa fase no la reabre: se encola en la siguiente. Un bloqueador repetido dos veces sin cambio en
el árbol lo cierra @director como `WONTFIX` con una línea de razón, y no vuelve. Sin commit nuevo
desde el veredicto anterior no hay nada que reauditar.

## 6. Qué no acepto como prueba

Un mensaje de chat. El informe del propio autor de lo construido. `npm run verify` verde **sin** las
capturas de §1 — en `5555989` convivían el verify en 0 y un input de 195×24 sin borde (D-061). Una
nota de Lighthouse sin su JSON. Una captura sin ruta, ancho y sha. "Se ve mejor", "más denso",
"premium".

## 7. Tres fallos de proceso de las últimas 54 h que esto impide

1. **G4 firmado en `5555989` con una puerta que ejecuta código y no pinta un píxel; D-061 lo retiró en cuanto un humano miró la pantalla.**
2. **Cinco reauditorías de la misma puerta (`80b58c5`, `5555989`, `9f79aa3`, `b2c499f`, `2d`/`3b`) porque los criterios se escribieron después de construir.**
3. **Un pipeline verde aceptado como prueba de otro hito: `verify` en 0 en M4 porque sus aserciones eran de M3 (D-055).**

## 8. Veredicto

Por fase y solo por fase: `READY FOR APPROVAL` · `NOT READY` + ids bloqueantes · `READY WITH
RESERVATIONS` + las reservas exactas. Capturas adjuntas. Nada se firma en un mensaje.

## Choques

- **Home:** art-direction §6 lista 7 bloques; cro-copy §1 lista 11. F1-3 exige el mayor (≥ 9) hasta que @director retire alguno.
- **3D:** art-direction §5 lo descarta; el "visual" de F1-2 y F2-4 es el `Pack Plate` tipográfico, no un canvas.
