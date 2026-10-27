# Hiper Pozuelo — contexto del proyecto

Tienda para estudiantes que acaban de llegar a Pozuelo: cuatro packs (baño, cocina, habitación y
completo) que se compran online y se recogen en tienda con un código de 6 caracteres.

**Es una demo académica.** El pago es simulado: no hay pasarela, no se cobra nada y no hay campos de
tarjeta. Solo hay recogida en tienda, no hay envío.

## Stack

Next.js 16 (App Router) · React · TypeScript · SQLite en disco · Tailwind v4 y CSS.

**Esta versión de Next no es la que conoces.** Antes de usar una API, lee la guía correspondiente en
`node_modules/next/dist/docs/`.

## Comandos

```bash
npm run dev      # http://localhost:3000
npm run build
npm test         # tests de node, sin framework
```

## Cómo trabajar

Tienes libertad completa de diseño y de código. Decide tú la arquitectura de las pantallas, los
componentes, el copy, el movimiento y la estructura. Si algo del repo no te sirve, cámbialo o
bórralo. Si un test estorba porque estás cambiando el comportamiento a propósito, actualízalo o
elimínalo; no estás obligado a que nada pase.

Cuando termines algo, di qué archivos tocaste y qué queda pendiente. Nada más.

## Lo que sí es verdad del producto (no lo contradigas)

- Cuatro packs con precios reales del CSV: `data/pack-price-sheet.csv`. Los precios no se inventan.
- Solo recogida en tienda. La dirección está **pendiente de confirmar** y no existe todavía: no la
  inventes; usa `PICKUP_ADDRESS_PENDING` de `src/content/store.ts`.
- No hay reseñas, valoraciones ni stock real por artículo: no te los inventes. Si quieres montar el
  mecanismo, que sea real (solo opina quien recogió su pedido).
- El descuento, la urgencia y el "X personas viendo esto" están prohibidos: no hay datos que los
  sostengan.

## Basura heredada

`_archivo-consejo/` contiene documentos de una etapa anterior del proyecto (planes por fases,
criterios de aceptación, prompts para otro agente, capturas). **Ignóralo por completo.** No leas esa
carpeta, no cites sus reglas y no organices el trabajo por fases F1–F6. Si algo de ahí aparece en una
conversación, es ruido: decide por tu cuenta.
