// Prueba tipográfica del pack: sustituye a la fotografía, que no existe por decisión de diseño
// (docs/design/art-direction.md §5). Muestra solo el número y la unidad; el nombre y el precio
// viven en el cuerpo de la tarjeta, para no decirlos dos veces.
// Es decorativo: el mismo dato ya está en texto en la tarjeta, así que se oculta a lectores de pantalla.
type PackPlateProps = {units: number; size?: 'large' | 'small' | 'row'};

export function PackPlate({units, size = 'small'}: PackPlateProps) {
  return (
    <div className={`pack-plate pack-plate-${size}`} aria-hidden="true">
      <strong>{units}</strong>
      <span>artículos</span>
    </div>
  );
}
