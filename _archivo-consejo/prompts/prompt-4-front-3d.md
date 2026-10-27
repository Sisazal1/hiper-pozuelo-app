# Prompt P-3D — piloto de ilustración isométrica (opción B, un solo intento)

Repo: `hiper-pozuelo-app`. **No es una fase del sitio.** Es un piloto aislado que se ejecuta cuando
F2 esté aprobada, y que puede terminar en "no". Si no gana, se descarta y no se vuelve a intentar.

## Qué se dibuja

Una ilustración isométrica **por pack**: una caja de mudanza abierta, vista en isométrico, con el
nombre del pack y el número de artículos. **No** se modelan los 52 objetos: se dibuja el contenedor y
su etiqueta. Estilo plano: dos tonos de la paleta (`--surface-warm`, `--red-brand`), líneas de 2 px,
una sola sombra proyectada, sin degradados fotográficos.

## Cómo

- Escribe a mano **SVG** por pack en `public/ilustraciones/<slug>.svg`, con `viewBox="0 0 400 300"`,
  sin `<image>` incrustada, sin fuentes externas (usa texto como trazado o `<text>` con la pila del
  sistema), y sin animación.
- Peso máximo **6 KB por archivo**, `fill` con los hex de la paleta (`#FFF8F3`, `#E30613`, `#1A1A1A`,
  `#E5E5E5`), sin `filter` ni `mask` costosos.
- Intégralo en la tarjeta y en la ficha **detrás** del número, con `aria-hidden="true"` y
  `width`/`height` explícitos (CLS 0). El `PackPlate` sigue siendo el que informa.
- No toques el layout: la ilustración ocupa el mismo hueco que el panel actual.

## Regla de salida, sin discusión

1. Genera capturas a 390 y 1280 **con** y **sin** ilustración (cuatro imágenes).
2. Compara: ¿el panel con ilustración comunica mejor que el panel tipográfico, o solo decora?
3. Si la respuesta no es un sí claro —por legibilidad, por peso o porque parece un clipart—,
   **borra los SVG** y deja el panel tipográfico. Un intento, no dos.
4. Escribe el veredicto en `docs/design/3d-verdict.md`, máximo 120 palabras, con las cuatro capturas
   y los pesos reales.

## Prohibido

WebGL, three.js, canvas, animación del render, imágenes de stock o generadas, modelos 3D de los
objetos, y tocar cualquier lógica o texto. Dependencias nuevas: ninguna.

## Criterios de aceptación

- O bien 4 SVG ≤ 6 KB integrados con CLS 0 y las capturas comparativas, o bien el panel tipográfico
  intacto y el veredicto escrito. **Ambos resultados son válidos**; lo que no vale es dejarlo a medias.
- `npm run verify` en **0** en los dos casos.
- Resumen: pesos, veredicto en una frase y qué se borró.
