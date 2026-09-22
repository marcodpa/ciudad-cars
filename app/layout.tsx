import { LanguageProvider } from '@/components/language-provider';
import { localizedMetadata, requestRoute } from '@/lib/page-metadata';
import { createStructuredData, serializeJsonLd } from '@/lib/seo';
import { pageCopy } from '@/lib/page-copy';
import { company } from '@/lib/company';
import { Barlow, Caveat, Outfit } from 'next/font/google';
import './globals.css';
import './pages.css';
import './showroom.css';
import './city.css';
import './catalog.css';
import './workshop.css';
import './cinema.css';
import './reservation.css';
import './language.css';
import './header-account.css';
import { ReservationProvider } from '@/components/reservation-provider';
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
export const metadata = {
  ...localizedMetadata('/'),
  icons: { icon: '/images/logo.png' },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { path, language } = await requestRoute();
  return (
    <html lang={language}>
      <body
        className={
          outfit.variable + ' ' + barlow.variable + ' ' + caveat.variable
        }
      >
        {pageCopy[path] && <script
          id="ciudad-cars-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              createStructuredData(path, language, pageCopy[path], company),
            ),
          }}
        />}
        <LanguageProvider initialLanguage={language}>
          <ReservationProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </ReservationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
