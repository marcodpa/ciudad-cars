export const siteNavigation = [
  { label: 'Inicio', href: '/' },
  { label: 'Vehículos', href: '/vehiculos' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Quiénes somos', href: '/quienes-somos' },
  { label: 'Contacto', href: '/contacto' },
] as const;

/** Recover old links that used the visible menu label instead of the route. */
export function legacyNavigationDestination(pathname: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const label = decoded
    .replace(/^\/+|\/+$/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
  // Preserve inbound links from the existing public website during the redesign.
  const previousPages: Record<string, string> = {
    'about-us': '/quienes-somos',
    'contact-us': '/contacto',
    service: '/servicios',
    'date-reservation': '/vehiculos',
  };
  if (Object.hasOwn(previousPages, label)) return previousPages[label];
  const destination = siteNavigation.find(
    (item) =>
      item.label
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-') === label,
  )?.href;
  return destination && pathname !== destination ? destination : null;
}
