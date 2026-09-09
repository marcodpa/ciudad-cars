import type { ComponentProps } from 'react';

/** Native document navigation keeps links usable without the client router. */
export default function SiteLink({ children, ...props }: ComponentProps<'a'>) {
  return <a {...props}>{children}</a>;
}
