// Typographic pack cover. The design system forbids photography and remote images while no
// verified pack photo exists (design-system.md §2, Q7 OPEN), so the cover is set in type:
// the pack's name, how many things are inside, and the price. No invented imagery, no stock art,
// nothing that pretends to be a photograph of a product we have not photographed.
export function PackCover({name, units, price, size = 'card'}: {name: string; units: number; price?: string; size?: 'card' | 'hero'}) {
  const word = name.replace(/^Pack\s+/i, '');
  return (
    <div className={`cover cover-${size}`} aria-hidden="true">
      <span className="cover-kicker">{units} artículos</span>
      <span className="cover-word">{word}</span>
      <span className="cover-rule" />
      {price ? <span className="cover-price">{price}</span> : null}
    </div>
  );
}
