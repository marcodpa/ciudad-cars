import Page from '@/components/pages/servicios';
import { localizedMetadata } from '@/lib/page-metadata';

// Deterministic metadata is emitted in the initial head for every visitor.
export const metadata = localizedMetadata('/servicios', 'en');
export default Page;
