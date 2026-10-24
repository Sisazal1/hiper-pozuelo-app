# Prompt F4 — datos estructurados, sitemap, sistema aplicado y movimiento

Repo: `hiper-pozuelo-app`. Esta fase no añade pantallas: hace que el sitio sea encontrable, medible y
consistente. Lee `docs/design/acceptance.md` §3 (umbrales) antes de empezar.

## 1. Datos estructurados (JSON-LD)

Crea `src/components/JsonLd.tsx` que renderice un `<script type="application/ld+json">` con el objeto
serializado. Sin dependencias.

- En cada ficha (`/packs/[slug]`): `Product` con `name`, `description` (= beneficio), `sku` (= slug),
  `brand` (`Hiper Pozuelo`), `offers` → `Offer` con `price` en EUR con dos decimales, `priceCurrency: "EUR"`,
  `availability` (`InStock` / `LimitedAvailability` / `OutOfStock` según `pack.availability`) y
  `url` absoluta. **No inventes `aggregateRating` ni `review`**: no existen.
- En la portada: `Organization` con `name`, `url` y `areaServed` (`Pozuelo de Alarcón`), sin `logo`
  (no hay archivo de logo).
- En el checkout: nada. Es un flujo privado y va `noindex`.

Define la URL base en `src/content/site.ts` (`SITE_URL`) leyendo `process.env.NEXT_PUBLIC_SITE_URL`
con fallback a `https://hiper-pozuelo.example`.

## 2. Sitemap y robots

- Crea `app/sitemap.ts`: portada, `/packs`, las cuatro fichas, `/como-funciona`, `/faq`, `/recogida`,
  `/legal` y los cuatro documentos legales. Fechas reales, `changeFrequency` sensato.
- Actualiza `app/robots.ts`: permite lo público, **prohíbe** `/checkout`, `/carrito`, `/pedido/`,
  `/mostrador` y `/dev/`, y declara el sitemap.

## 3. Metadatos por página

Cada ruta necesita `title` y `description` propios (no el genérico del layout). La ficha usa el nombre
del pack y su beneficio. Añade `openGraph` por ficha con `title`, `description` y la imagen OG que ya
genera la app. Añade `alternates.canonical` con la URL absoluta.

## 4. Sistema aplicado y movimiento

- Repasa los componentes de `src/components` y asegura **cinco estados** en todo lo interactivo:
  default, hover, `focus-visible` (anillo de 3 px, offset 2), active, disabled con razón escrita.
  0 sombras salvo la barra sticky.
- Transiciones: 120 ms en hover/foco, 160 ms en cambio de estado, `cubic-bezier(.2,0,.3,1)`, solo
  `opacity`, `transform` ≤4 px, `background-color` y `border-color`.
- Toda transición va dentro de `@media (prefers-reduced-motion: no-preference)`. Con
  `prefers-reduced-motion: reduce` no hay transform ni transición: el estado cambia seco.
- Prohibido: animaciones en bucle, parallax, skeletons con brillo, contadores animados.

## 5. Presupuesto de rendimiento

Crea `scripts/perf.mjs` (no lo metas en `verify`): arranca la app, mide en la portada y en una ficha
el número de peticiones, el peso total de JS y el LCP con `PerformanceObserver`, e imprime una tabla.
Umbrales: JS inicial ≤ 200 KB gzip, peticiones ≤ 14, LCP ≤ 2,0 s en 4G simulada, CLS 0.

## Prohibido

Tocar lógica de negocio, `app/api/**`, `src/server/**`, `src/lib/db.ts`, `flow.mjs`, `tests/**`
(salvo añadir un test nuevo si hace falta), precios, textos aprobados. Dependencias nuevas: ninguna.

## Criterios de aceptación

- El JSON-LD de una ficha se valida: pega el JSON extraído del HTML y confirma que no hay
  `aggregateRating`, `review` ni `logo`.
- `/sitemap.xml` lista todas las rutas públicas y `/robots.txt` bloquea las privadas.
- Cada ruta tiene `title`, `description` y `canonical` distintos.
- Con `prefers-reduced-motion: reduce` emulado, ninguna transición cambia `transform`.
- `scripts/perf.mjs` imprime la tabla y los cuatro números están dentro de umbral.
- `npm run verify` en **0** (pega la salida).
- Capturas: `docs/reviews/f4-home-390.png`, `f4-ficha-1280.png`, y el JSON del JSON-LD en el resumen.

Resumen final: rutas con metadatos, números de rendimiento y lo que quedó fuera.
