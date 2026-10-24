# Hiper Pozuelo — packs de llegada para estudiantes

Tienda de una sola visita para estudiantes que acaban de llegar a Pozuelo de Alarcón: cuatro packs
(baño, cocina, habitación y completo) que se compran online y se recogen en tienda con un código.

**Es una demostración académica.** No es la tienda real, no se cobra nada y el pago es simulado. El
aviso aparece en la banda superior de todas las páginas.

## Stack

Next.js (App Router) · TypeScript · SQLite en disco · sin dependencias de UI.
Sin fotografía: la identidad es tipográfica por decisión de diseño (`docs/design/art-direction.md`).

## Empezar

```bash
npm install
npm run dev          # http://localhost:3000
npm run verify       # el examen completo: contenido, tests, build, compra simulada y eventos
```

`npm run verify` es la única prueba que cuenta: compila, corre los tests, levanta la app, hace una
compra de punta a punta y comprueba los diez eventos. Si sale 0, el camino del dinero está sano.

## Estructura

```
app/                 rutas (home, packs, ficha, carrito, checkout, pase, mostrador, legal)
src/components/      UI
src/content/         datos y textos (packs.generated.json es la fuente de precios y contenidos)
src/server/          órdenes, pagos simulados, capacidad
src/lib/             db, eventos, formato
docs/design/         dirección de arte, copy, criterios de aceptación, implementación
docs/prompts/        los prompts con los que se construye cada fase
docs/reviews/        capturas de aceptación por fase
scripts/             content build, verify, flow, events proof
```

## Estado

- **F1 — chrome y portada:** construida. Pendiente una ronda de corrección (`docs/prompts/prompt-4-front-1b.md`):
  dos bloques sin texto, el nombre y el precio duplicados en la tarjeta, y un panel con demasiado vacío.
- **F2 — catálogo y ficha:** sin empezar.
- **F3 — carrito y checkout visual:** sin empezar.
- **F4 — sistema aplicado, ES/EN, JSON-LD, sitemap:** sin empezar.

## Datos y privacidad

Solo se recogen nombre y teléfono, para preparar y entregar el pedido. Sin cookies, sin analítica de
terceros. Los datos de la demo viven en `data/` y no se versionan.
