import { NextResponse, type NextRequest } from 'next/server';
import { legacyNavigationDestination } from './lib/navigation';
import { siteOrigin } from './lib/seo';

export function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === 'www.ciudadcars.com') {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname + request.nextUrl.search, siteOrigin),
      308,
    );
  }
  const destination = legacyNavigationDestination(request.nextUrl.pathname);
  if (destination) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url, 308);
  }
  // The URL determines the language for users and crawlers, regardless of cookies.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-ciudad-cars-path', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ['/((?!_next/|images/|cinema/|assets/).*)'] };
