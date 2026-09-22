import { RentalProvider } from '@/components/rental/rental-provider';
import '@/app/rental.css';
import '@/app/billing.css';
export const metadata = {
  title: 'Mi cuenta | Ciudad Cars',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: null, languages: {} },
  openGraph: { title: 'Ciudad Cars · Alquileres' },
};
export default function RentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RentalProvider>{children}</RentalProvider>;
}
