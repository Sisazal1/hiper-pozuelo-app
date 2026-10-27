# F6 — pasar la revisión de diseño (OpenCode)

Trabajas en `hiper-pozuelo-app`. Lee antes `docs/design/acceptance.md` §3 y `docs/design/art-direction.md` §5-§8.

## Paso 0 — auditoría (sin tocar código)

Revisa la portada, `/packs` y `/packs/completo` a 390, 768 y 1280 y compara contra los umbrales.
Devuelve una lista de 5-8 huecos concretos con evidencia (selector, medida o captura). Máximo 250
palabras. No propongas un rediseño: enumera lo que falla según los documentos.

## Paso 1 — tres correcciones

1. **Las cuatro cajas son el mismo cubo.** `PackVisual` dibuja la misma geometría y solo cambia el
   color. Cada pack necesita una composición propia, reconocible a 96 px:
   - `bano`: caja baja y ancha, con una franja horizontal (toallas plegadas).
   - `cocina`: caja alta con una circunferencia vista en perspectiva (sartén).
   - `habitacion`: caja con un plano inclinado encima (colchón/sábana).
   - `completo`: tres cajas apiladas de distinto tamaño.
   Todo en CSS (`transform`, `border-radius`, gradientes), 0 KB de imágenes, sin SVG externo, sin
   WebGL. Respeta `prefers-reduced-motion`.
2. **El bloque oscuro "El pack se llena" pesa demasiado** (≈1.100 px de negro). Pártelo: la
   introducción y las 6 cifras de grupo en un bloque oscuro corto (≤420 px), y la lista completa de
   artículos en una sección clara aparte, en dos columnas y con acordeón por grupo. Sin perder ni un
   dato ni un texto aprobado.
3. **Ritmo vertical**: ninguna sección con más de 96 px de aire entre bloques en móvil; los títulos
   `h2` de sección, alineados al mismo margen que las tarjetas.

## Prohibido

`app/api/**`, `src/server/**`, `src/lib/db.ts`, `src/lib/cart.ts`, `scripts/**`, `tests/**`,
`flow.mjs`, precios, `packs.generated.json`, textos de `src/content/`. Dependencias nuevas: ninguna.
No cambies la lógica del carrito ni del checkout.

## Entrega

- `npm run verify` en **0**, salida pegada. No lo ejecutes con el servidor de desarrollo levantado.
- Capturas: `docs/reviews/f6-home-390.png`, `f6-home-1280.png`, `f6-packs-1280.png`,
  `f6-ficha-1280.png`.
- Resumen de 8 líneas: qué cambiaste, medidas antes/después del bloque oscuro, y qué quedó fuera.
