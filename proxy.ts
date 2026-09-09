import { NextResponse, type NextRequest } from 'next/server';
import { legacyNavigationDestination } from './lib/navigation';

export function proxy(request: NextRequest) {
  const destination = legacyNavigationDestination(request.nextUrl.pathname);
  if (!destination) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = destination;
  return NextResponse.redirect(url, 307);
}

export const config = { matcher: ['/((?!_next/|images/).*)'] };
