import type {Metadata} from 'next';
export const metadata: Metadata = {title: 'Mostrador', description: 'Entrega de pedidos en el mostrador.', robots: {index: false, follow: false}};
export default function CounterLayout({children}: {children: React.ReactNode}) {return children;}
