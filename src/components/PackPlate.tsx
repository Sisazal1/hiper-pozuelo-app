type PackPlateProps = {name: string; units: number; price?: string; size?: 'large' | 'small' | 'row'};
export function PackPlate({name, units, price, size = 'small'}: PackPlateProps) {
  return <div className={`pack-plate pack-plate-${size}`} aria-label={`${name}, ${units} artículos`}><strong>{units}</strong><span>artículos</span><b>{name}</b>{price ? <small>{price}</small> : null}</div>;
}
