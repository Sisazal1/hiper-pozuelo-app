export type Copy = {
  brand: string; homeTitle: string; homeLead: string; packs: string; viewPacks: string; how: string; cart: string; viewPack: string; pickup: string; simulated: string; demoPrice: string; contents: string; coverage: string; pack: string; items: string; groups: string; notIncluded: string; where: string; questions: string; returnTitle: string; returnText: string; noShipping: string; chooseTime: string; code: string; close: string; search: string; language: string; es: string; en: string; englishOnly: string; availability: Record<'in_stock' | 'low_stock' | 'sold_out', string>; steps: {title: string; line: string}[];
};
export const copyEs: Copy = {
  brand: 'Hiper Pozuelo', homeTitle: 'Cuatro packs para tu primer día de piso.', homeLead: 'Mira qué entra, cuánto cuesta y cuándo lo recoges.',
  packs: 'Packs para estudiantes', viewPacks: 'Ver los 4 packs', how: 'Cómo funciona', cart: 'Carrito', viewPack: 'Ver pack',
  pickup: 'Recogida en tienda · Gratis', simulated: 'Pago simulado, sin cargo', demoPrice: 'Precio de demostración · IVA incluido',
  contents: 'Qué entra', coverage: 'Qué cubre cada pack', pack: 'Pack', items: 'Artículos', groups: 'Grupos', notIncluded: 'No incluye',
  where: 'Dónde lo recoges', questions: 'Dudas antes de comprar', returnTitle: 'Tu derecho a devolverlo', returnText: '14 días desde la recogida.',
  noShipping: 'Recogida en tienda. Sin envíos.', chooseTime: 'Eliges día y hora al pagar.', code: 'Con el código de 6 caracteres del pase.', close: 'Elige tu pack: verás todo lo que entra antes de pagar.',
  search: 'Buscar packs', language: 'Idioma', es: 'ES', en: 'EN', englishOnly: 'English available on the home page only',
  availability: {in_stock: 'Disponible', low_stock: 'Últimas unidades', sold_out: 'Agotado'},
  steps: [{title: 'Elige tu pack', line: 'Tienes cuatro: baño, cocina, habitación y completo.'}, {title: 'Paga una vez', line: 'Precio con IVA incluido, sin coste añadido. En la demo el pago es simulado.'}, {title: 'Recoge con un código', line: 'Te damos un código de 6 caracteres. Con eso basta en el mostrador.'}],
};
