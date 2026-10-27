# Prompt F3 — carrito y checkout (solo presentación, cero lógica)

Repo: `hiper-pozuelo-app`. **No cambies el comportamiento de compra**: solo cómo se ve. Lee
`docs/design/art-direction.md` §6 (carrito y checkout) antes de empezar.

## Regla número uno

El carrito ya funciona: guarda en `localStorage['cart']`, calcula con `src/lib/cart.ts` y envía
eventos con `src/lib/session.ts`. El checkout ya crea pedidos contra `app/api/checkout`. **Todo eso se
queda igual.** No toques los `fetch`, ni el payload, ni los `id`/`name` de los campos: hay pruebas que
dependen de ellos.

## Qué construyes

### Carrito — `app/carrito/page.tsx`

- Una línea por pack: `PackPlate` tamaño `row` (64×48), nombre, `N artículos`, **stepper** de cantidad
  (mínimo 1, máximo 5: el botón que no aplica queda `disabled` con razón escrita), precio de línea,
  y "Quitar".
- **Panel de resumen** al final: `Subtotal`, `Recogida en tienda · Gratis`, `Total` (con `tabular-nums`),
  y el botón primario `Continuar · {total}`.
- Estado vacío real: titular `Tu carrito está vacío`, una línea de ayuda y botón "Ver los 4 packs".
- Enlace secundario "Añadir otro pack".
- Si el carrito cambia, el total se actualiza sin recargar (ya ocurre: no lo rompas).

### Checkout — `app/checkout/page.tsx`

- `StepHeader` con cuatro pasos: `Tus datos` · `Día y hora` · `Pago` · `Revisar`. Paso activo en rojo,
  los demás en tinta secundaria, con `aria-current="step"`.
- **Datos:** nombre y teléfono, etiqueta visible (no solo placeholder), `autocomplete` correcto,
  error por campo y resumen de errores con `role="alert"` arriba del formulario.
- **Día y hora:** chips de día (`SlotDayChip`: libre / seleccionado / completo) y tarjetas de franja con
  "Quedan N huecos" cuando queden dos o menos. Nunca inventes disponibilidad: usa la que ya trae la app.
- **Pago:** panel con `Pago simulado`, `Entorno de prácticas: no se realiza ningún cargo.` y el botón
  `Simular pago · {total}`. Un fallo pinta una alerta de error de altura reservada (no debe mover el
  layout) con una sola acción.
- **Bloque de desistimiento** antes del botón de pago: `Tu derecho a devolverlo` + `14 días desde la recogida.`
- Botón fijo al pie en móvil con el total, respetando `safe-area-inset-bottom`.

## Archivos

Crea en `src/components/`: `QuantityStepper.tsx`, `SummaryPanel.tsx`, `StepHeader.tsx`,
`SlotDayChip.tsx`, `SlotWindowCard.tsx`, `StickyCheckoutBar.tsx`.
Modifica: `app/carrito/page.tsx`, `app/checkout/page.tsx`, `src/components/Alert.tsx`, `app/globals.css`.

## Prohibido

`app/api/**`, `src/server/**`, `src/lib/db.ts`, `src/lib/cart.ts`, `src/lib/session.ts`, `scripts/**`,
`tests/**`, `flow.mjs`, precios, textos ya aprobados de `src/content/checkout.ts` (puedes **usarlos**,
no reescribirlos), `id`/`name` de formularios. Ninguna dependencia nueva.

## Criterios de aceptación

- El carrito sobrevive a un refresco y el total coincide con la suma de líneas.
- El stepper no baja de 1 ni sube de 5; el límite está deshabilitado y explica por qué.
- Un pago fallido deja el carrito intacto y muestra la alerta sin mover el layout.
- 0 elementos interactivos < 44×44 a 390. Sin scroll horizontal en 390, 768 y 1280.
- `npm run verify` en **0** (pega la salida: incluye la compra simulada de punta a punta).
- Capturas: `docs/reviews/f3-carrito-390.png`, `f3-carrito-vacio-390.png`, `f3-checkout-390.png`,
  `f3-checkout-1280.png`.

Resumen final: archivos tocados y confirmación de que el payload de checkout no cambió.
