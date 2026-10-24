import Link from 'next/link';

export function Breadcrumbs({trail}: {trail: {label: string; href?: string}[]}) {
  return <nav className="breadcrumbs" aria-label="Migas de pan"><ol>{trail.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
