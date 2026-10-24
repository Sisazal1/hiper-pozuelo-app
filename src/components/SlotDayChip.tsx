export function SlotDayChip({label, selected}: {label: string; selected?: boolean}) {return <span className={`slot-day-chip${selected ? ' is-selected' : ''}`} aria-pressed={selected}>{label}</span>}
