import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  RentalData,
  RentalProfile,
  BookingInput,
  RentalOrder,
  ActionInput,
  RentalUnit,
} from './rental-domain';
export type RentalConnection = {
  configured: boolean;
  client: SupabaseClient | null;
};
let connection: Promise<RentalConnection> | undefined;
export function rentalConnection() {
  return (connection ??= fetch('/api/rental-config')
    .then(async (response) => {
      if (!response.ok)
        throw new Error('No pudimos conectar. Intenta de nuevo.');
      const config = (await response.json()) as {
        configured: boolean;
        url: string;
        key: string;
      };
      return {
        configured: config.configured,
        client: config.configured ? createClient(config.url, config.key) : null,
      };
    })
    .catch((error) => {
      connection = undefined;
      throw error;
    }));
}
export function rentalError(error: unknown) {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String(error.message)
        : 'No se pudo completar la operación.';
  if (/Invalid login credentials/.test(raw))
    return 'Correo o contraseña incorrectos.';
  if (/Email not confirmed/.test(raw))
    return 'Confirma tu correo antes de ingresar.';
  if (/already registered/.test(raw))
    return 'Este correo ya está registrado. Ingresa o recupera tu contraseña.';
  if (/rate limit|too many/i.test(raw))
    return 'Demasiados intentos. Espera unos minutos y vuelve a probar.';
  if (/exclusion|rental_no_overlap/i.test(raw))
    return 'Otra orden acaba de ocupar esa unidad. Actualiza y selecciona otra.';
  if (/duplicate key|unique constraint/i.test(raw))
    return 'Ya existe esa referencia o matrícula. Revisa los datos.';
  if (/check constraint|invalid input syntax|null value/i.test(raw))
    return 'Revisa los campos y las fechas antes de continuar.';
  return raw;
}
export async function fetchRentalData(client: SupabaseClient) {
  const tables = [
    'models',
    'units',
    'orders',
    'profiles',
    'payments',
    'events',
  ] as const;
  const results = await Promise.all(
    tables.map(async (table) => {
      const rows: Record<string, unknown>[] = [];
      // Explicit pagination avoids silently losing availability or money at PostgREST's row limit.
      for (let start = 0; ; start += 500) {
        const { data, error } = await client
          .from(`rental_${table}`)
          .select('*')
          .order('id')
          .range(start, start + 499);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 500) return rows;
      }
    }),
  );
  return Object.fromEntries(
    tables.map((table, i) => [table, results[i]]),
  ) as RentalData;
}
export async function fetchRentalProfile(
  client: SupabaseClient,
): Promise<RentalProfile | null> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') throw error;
  if (!user) return null;
  const { data, error: profileError } = await client
    .from('rental_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profileError) throw profileError;
  return data;
}
export async function createRentalOrder(
  client: SupabaseClient,
  input: BookingInput,
  request: string,
): Promise<RentalOrder> {
  const { data, error } = await client.rpc('rental_create_order', {
    p_input: input,
    p_request_id: request,
  });
  if (error) throw error;
  return data;
}
export async function runRentalAction(
  client: SupabaseClient,
  input: ActionInput,
) {
  const { data, error } = await client.rpc('rental_order_action', {
    p_input: input,
  });
  if (error) throw error;
  return data as RentalOrder;
}
export async function saveRentalUnit(
  client: SupabaseClient,
  unit: Omit<RentalUnit, 'id'> & { id?: string },
) {
  const { error } = await client.rpc('rental_save_unit', { p_input: unit });
  if (error) throw error;
}
