# Prompt 4b · Corrección de F1 (una sola ronda)

La fase F1 ya está construida y `npm run verify` sale 0. **No rehagas la portada.** Hay cuatro
defectos concretos y este prompt cierra exactamente esos cuatro. Nada más.

Antes de tocar código, lee `docs/design/cro-copy-2.md`: son los textos que faltaban.

---

## Defecto 1 — Los bloques 7 y 9 están vacíos

`app/page.tsx` tiene `<li><strong>1</strong>{/* PENDIENTE @marketing */}</li>` y cuatro `<details>`
sin texto. Por eso la portada parece a medias.

Sustituye cada pendiente por el texto de `docs/design/cro-copy-2.md` §1 y §2, literal, con estos
dos cambios que manda el propietario:

- **Duda 4** — no existe teléfono de atención. La respuesta es:
  `Puede venir otra persona con tu código. Si se te pasa la franja, el pedido caduca y los artículos vuelven a estar disponibles.`
- **Duda 3** — no afirmes excepciones de higiene que no están en las condiciones. La respuesta es:
  `Sí, tienes 14 días desde la recogida. Las condiciones están en Condiciones de compra.`

Al terminar, `grep -rn "PENDIENTE" app src` debe devolver **0**.

## Defecto 2 — El nombre y el precio salen dos veces por tarjeta

`PackPlate` pinta `{units}`, `artículos`, `{name}` y `{price}`, y el cuerpo de la tarjeta vuelve a
pintar nombre, precio y disponibilidad. Se ve repetido y abarata el conjunto.

- `src/components/PackPlate.tsx`: deja **solo** el número grande y la palabra `artículos`.
  Quita `name` y `price` de las props y del render. Mantén `aria-label` con el nombre y las unidades.
- `app/page.tsx`: la tarjeta conserva nombre, `N artículos`, precio, `PriceLabel`, disponibilidad y CTA.
- Criterio: el nombre y el precio aparecen **una vez** por tarjeta.

## Defecto 3 — El panel del pack es un hueco de 280 px con un número

`.pack-plate` usa `aspect-ratio:4/3` y `justify-content:flex-end`: deja dos tercios vacíos y empuja el
número al borde inferior. Es lo que hace que la rejilla parezca un wireframe.

- `aspect-ratio` fuera. `min-height: 132px`, `justify-content: center`, `align-items: flex-start`.
- El número pasa a `font-size: 56px; line-height: 1` y `artículos` debajo, en `micro`.
- Añade un filete superior de 3 px `var(--brand-red)` dentro del panel, de 40 px de ancho, como marca.
- Criterio: el panel no supera 160 px de alto a 390 px y no contiene espacio muerto mayor que el
  propio número.

## Defecto 4 — La fila de confianza se apila y abre un hueco de 100 px

En `app/globals.css` hay **dos** reglas `.trust-row`: una con tres columnas y otra, más abajo, con
`grid-template-columns:1fr`, sin `@media`. La segunda gana en todos los anchos, así que los tres
ítems se apilan y cada uno ocupa el ancho completo.

- Deja **una sola** regla. Tres columnas desde 600 px; por debajo, una columna con
  `padding: 10px 16px` y separadores de 1 px, sin `gap`.
- La fila va pegada al bloque del titular: `margin: 0` y sin `margin-bottom` de bloque.
- Criterio: entre los CTA y la fila de confianza no hay más de 32 px a 390 px.

## Prohibido en esta ronda

Tocar `app/api/**`, `src/server/**`, `src/lib/db.ts`, `scripts/**`, `tests/**`, precios, el archivo
`packs.generated.json`, `PackCover.tsx`, las otras páginas, o reescribir bloques que ya funcionan.
Ninguna dependencia nueva.

## Cierre

1. `npm run verify` en `0`, con la salida pegada.
2. Capturas nuevas: `docs/reviews/f1b-390.png`, `f1b-768.png`, `f1b-1280.png`.
3. Resumen de tres líneas: qué cambió, y confirma que `PENDIENTE` y la duplicación desaparecieron.
