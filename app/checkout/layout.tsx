import type {Metadata} from 'next';
export const metadata: Metadata = {title: 'Finalizar compra', description: 'Completa los datos, la franja y el pago simulado.', robots: {index: false, follow: false}};
export default function CheckoutLayout({children}: {children: React.ReactNode}) {return children;}
