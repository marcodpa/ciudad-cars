import Page from '@/components/pages/quienes-somos';
import { localizedMetadata } from '@/lib/page-metadata';

// Deterministic metadata is emitted in the initial head for every visitor.
export const metadata = localizedMetadata('/quienes-somos', 'es');
export default Page;
