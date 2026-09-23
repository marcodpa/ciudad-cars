import { redirect } from 'next/navigation';
import { fleet } from '@/lib/fleet';
export const metadata = { title: 'Reservar un vehículo | Ciudad Cars' };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string; demo?: string }>;
}) {
  const params = await searchParams;
  const model =
    fleet.find((vehicle) => vehicle.id === params.modelo)?.id || '1';
  redirect(
    `/vehiculos?reservar=${model}${params.demo === '1' ? '&demo=1' : ''}`,
  );
}
