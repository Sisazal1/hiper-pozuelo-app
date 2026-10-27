# Prompt F5 — inglés para estudiantes internacionales (alcance cerrado)

Repo: `hiper-pozuelo-app`. El público son estudiantes Erasmus: muchos no leen español todavía.
Esta fase añade **inglés en la portada y el chrome**, no en todo el sitio. Se declara así para no
dejar media traducción: si una cadena no está traducida, la página sigue en español y lo dice.

## Alcance exacto

- Idiomas: `es` (por defecto) y `en`.
- Selector en la cabecera y en el pie: dos enlaces `ES` / `EN`, con `aria-current` en el activo.
- El idioma viaja en la URL (`?lang=en`), se recuerda en `localStorage['lang']` y se aplica al
  renderizar en servidor leyendo el parámetro. Sin cookies, sin dependencias, sin redirecciones.
- Traducido en esta fase: **cabecera, portada completa, pie, banda de aviso y las etiquetas de la
  ficha** (nombre del pack, precio, disponibilidad, "Qué entra", "Comprar"). El contenido de los
  packs (nombres de artículos) **no se traduce**: son listas reales en español y fingir lo contrario
  sería peor.
- El resto de rutas siguen en español y el selector lo indica (`title` con "English available on the
  home page only") — sin mentir al usuario.

## Cómo

- Crea `src/content/copy.ts` con el diccionario español tipado y `src/content/copy.en.ts` con el mismo
  tipo (`type Copy = typeof copyEs`), de forma que una clave que falte **rompa la compilación**.
- Crea `src/content/lang.ts` con `resolveLang(searchParams)` y `withLang(href, lang)`.
- `app/layout.tsx` recibe el idioma y pone `lang` y `dir` en `<html>`, y `hreflang` alternos
  (`es`, `en`, `x-default`) mediante `alternates.languages` en los metadatos.
- Ninguna cadena nueva inventada: las traducciones son de los textos que ya existen en
  `src/content/`. Si un texto no existe, no se traduce.

## Criterios de aceptación

- `/?lang=en` renderiza la portada en inglés **desde el servidor** (no un cambio en cliente): el HTML
  inicial ya viene traducido.
- `?lang=en` combinado con `?q=` y con los filtros de F2 no rompe ninguno de los dos.
- `<html lang="en">` y los `hreflang` correctos en la portada; en el resto, `lang="es"`.
- Si falta una clave inglesa, el build falla (demuéstralo: comenta una y pega el error, luego
  descoméntala).
- `npm run verify` en **0**.
- Capturas: `docs/reviews/f5-home-es-390.png`, `f5-home-en-390.png`, `f5-home-en-1280.png`.

Resumen final: claves traducidas, claves que dejaste en español a propósito y el resultado del test
de compilación fallida.
