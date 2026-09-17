import Page from '@/components/pages/inicio';
import { localizedMetadata } from '@/lib/page-metadata';

// Deterministic metadata is emitted in the initial head for every visitor.
export const metadata = localizedMetadata('/', 'en');
export default Page;
