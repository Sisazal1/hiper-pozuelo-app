import type {Metadata} from 'next';
export const metadata: Metadata = {title: 'Tu carrito', description: 'Revisa tus packs y el total antes de continuar.', robots: {index: false, follow: false}};
export default function CartLayout({children}: {children: React.ReactNode}) {return children;}
