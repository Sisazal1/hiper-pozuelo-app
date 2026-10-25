# Hiper Pozuelo — guía para el agente de código

Tienda de cuatro packs de llegada para estudiantes en Pozuelo de Alarcón. Next.js (App Router),
TypeScript, SQLite en disco. **Es una demostración académica**: el pago es simulado y no se cobra nada.

Antes de tocar nada, lee los documentos de `docs/design/` que lista `opencode.json`. En resumen:

| Archivo | Para qué |
|---|---|
| `docs/design/art-direction.md` | Retícula, tipografía, color, movimiento, componentes |
| `docs/design/cro-copy.md` y `cro-copy-2.md` | Qué dice cada bloque y con qué texto exacto |
| `docs/design/acceptance.md` | Qué se mide para aprobar una fase (capturas incluidas) |
| `docs/design/implementation.md` | Plan de archivos por fase |

Los encargos están en `docs/prompts/`: F2 catálogo y ficha, F3 carrito, F4 datos estructurados,
F5 inglés, y un piloto 3D aparte. **Una fase por sesión**, de una en una.

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run verify   # la única prueba que cuenta
```

`npm run verify` compila, corre los tests, levanta la app, hace una compra de punta a punta y
comprueba diez eventos. **Si no sale 0, el trabajo no está hecho.** No lo lances con el servidor de
desarrollo levantado: el build falla por el lock.

## Reglas duras

1. **No toques la lógica de negocio**: `app/api/**`, `src/server/**`, `src/lib/db.ts`,
   `src/lib/cart.ts`, `src/lib/session.ts`, `scripts/**`, `tests/**` ni `flow.mjs`. Hay pruebas que
   dependen de ellos.
2. **No cambies** precios, `data/pack-price-sheet.csv`, `src/content/packs.generated.json` ni los
   textos aprobados de `src/content/`.
3. **Sin dependencias nuevas** sin justificar el coste.
4. **Nada de fotos ni imágenes de stock.** El visual del pack es `PackVisual`: panel de color con una
   caja isométrica en CSS. No inventes reseñas, testimonios, stock, urgencia ni envío a domicilio.
5. Accesibilidad: WCAG 2.2 AA, foco visible, 44×44 px táctil, `prefers-reduced-motion` respetado.
6. Entrega siempre: `npm run verify` en 0 (salida pegada) y capturas a 390, 768 y 1280 en
   `docs/reviews/`.

## Estado por fases

| Fase | Estado |
|---|---|
| F1 portada y chrome | hecha (`40a9f14`, `d46b985`) |
| F2 catálogo y ficha | hecha — revisar contra `acceptance.md` |
| F3 carrito y checkout visual | hecha — el payload de checkout no debe cambiar |
| F4 datos estructurados, sitemap, metadatos | hecha |
| F5 inglés en portada y chrome | hecha |
| Fotos, dirección de tienda, stock por artículo | pendientes: son decisiones del propietario |

## Next.js

Esta versión tiene cambios respecto a otras. Antes de escribir código consulta
`node_modules/next/dist/docs/`. No borres el bloque `nextjs-agent-rules` de `AGENTS.md`: `next dev`
lo vuelve a escribir.
