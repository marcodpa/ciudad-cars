import Page from '@/components/pages/vehiculos';
import { localizedMetadata } from '@/lib/page-metadata';

// Deterministic metadata is emitted in the initial head for every visitor.
export const metadata = localizedMetadata('/vehiculos', 'es');
export default Page;
