import type { Metadata } from 'next';
import { Barlow, Caveat, Outfit } from 'next/font/google';
import './globals.css';
import './pages.css';
import './showroom.css';
import './city.css';
import './catalog.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});
const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  display: 'swap',
});
const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  display: 'swap',
});
export const metadata: Metadata = {
  title: 'Ciudad Cars | Alquila tu carro en Maracaibo',
  description:
    'Tu carro en Maracaibo. Conoce la flota de Ciudad Cars: Mitsubishi Lancer, Chevrolet Cruze, Toyota Camry, Jeep Cherokee y Ford Explorer o similares. Desde $75 al día.',
  icons: { icon: '/images/logo.png' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={
          outfit.variable + ' ' + barlow.variable + ' ' + caveat.variable
        }
      >
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
