import Link from 'next/link';

export function FilterChip({label, href, active, count}: {label: string; href: string; active?: boolean; count?: number}) {
  return <Link className={`filter-chip${active ? ' is-active' : ''}`} href={href} aria-current={active ? 'true' : undefined}>{label}{count !== undefined ? ` · ${count}` : ''}</Link>;
}
