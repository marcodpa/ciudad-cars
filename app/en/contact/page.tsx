import Page from '@/components/pages/contacto';
import { localizedMetadata } from '@/lib/page-metadata';

// Deterministic metadata is emitted in the initial head for every visitor.
export const metadata = localizedMetadata('/contacto', 'en');
export default Page;
