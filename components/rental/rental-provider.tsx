'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  rentalConnection,
  fetchRentalProfile,
  fetchRentalData,
  createRentalOrder,
  runRentalAction,
  saveRentalUnit,
  rentalError,
} from '@/lib/rental-client';
import {
  createDemoData,
  demoAdmin,
  demoCustomer,
  demoCreateOrder,
  demoAction,
} from '@/lib/rental-demo';
import {
  availableUnits,
  type RentalData,
  type RentalProfile,
  type BookingInput,
  type RentalOrder,
  type ActionInput,
  type RentalUnit,
} from '@/lib/rental-domain';

import {
  ensureBillingData,
  demoBillingAction,
  demoBillingSettings,
} from '@/lib/billing-demo';
import type {
  BillingInput,
  BillingDocument,
  BillingSettings,
} from '@/lib/billing-domain';

type Context = {
  billingAction: (input: BillingInput) => Promise<BillingDocument>;
  billingSettings: (input: BillingSettings) => Promise<void>;
  loading: boolean;
  configured: boolean;
  demo: boolean;
  error: string;
  client: SupabaseClient | null;
  user: RentalProfile | null;
  data: RentalData;
  refresh: () => Promise<void>;
  href: (path: string) => string;
  createOrder: (input: BookingInput, request: string) => Promise<RentalOrder>;
  action: (input: ActionInput) => Promise<void>;
  saveUnit: (unit: Omit<RentalUnit, 'id'> & { id?: string }) => Promise<void>;
  setRate: (model: string, rate: number) => Promise<void>;
  availability: (start: string, end: string) => Promise<Record<string, number>>;
  logout: () => Promise<void>;
  resetDemo: () => void;
};
const empty: RentalData = {
  models: [],
  units: [],
  orders: [],
  profiles: [],
  payments: [],
  events: [],
};
const RentalContext = createContext<Context | null>(null);
const demoKey = 'ciudad-cars-rental-demo-v1';
export function RentalProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true),
    [configured, setConfigured] = useState(false),
    [demo, setDemo] = useState(false),
    [error, setError] = useState('');
  const [client, setClient] = useState<SupabaseClient | null>(null),
    [user, setUser] = useState<RentalProfile | null>(null),
    [data, setData] = useState<RentalData>(empty);
  const dataRef = useRef(data);
  const publishDemo = useCallback((next: RentalData) => {
    sessionStorage.setItem(demoKey, JSON.stringify(next));
    dataRef.current = next;
    setData(next);
  }, []);
  const refresh = useCallback(async () => {
    if (demo) return;
    if (!client) return;
    const profile = await fetchRentalProfile(client);
    setUser(profile);
    if (profile) {
      const next = await fetchRentalData(client);
      dataRef.current = next;
      setData(next);
    } else setData(empty);
  }, [client, demo]);
  useEffect(() => {
    let alive = true;
    async function init() {
      try {
        const params = new URLSearchParams(location.search);
        if (params.get('demo') === '1') {
          let next: RentalData;
          try {
            const saved = sessionStorage.getItem(demoKey);
            next = saved ? JSON.parse(saved) : createDemoData();
            if (!next.orders || !next.models || !next.units) throw new Error();
          } catch {
            next = createDemoData();
          }
          if (!alive) return;
          setDemo(true);
          publishDemo(ensureBillingData(next));
          const role =
            params.get('role') ||
            sessionStorage.getItem('cc-demo-role') ||
            'admin';
          sessionStorage.setItem('cc-demo-role', role);
          setUser(role === 'customer' ? demoCustomer : demoAdmin);
          return;
        }
        const connection = await rentalConnection();
        if (!alive) return;
        setConfigured(connection.configured);
        setClient(connection.client);
        if (connection.client) {
          const profile = await fetchRentalProfile(connection.client);
          if (!alive) return;
          setUser(profile);
          if (profile) {
            const next = await fetchRentalData(connection.client);
            if (alive) {
              dataRef.current = next;
              setData(next);
            }
          }
        }
      } catch (e) {
        if (alive) setError(rentalError(e));
      } finally {
        if (alive) setLoading(false);
      }
    }
    void init();
    return () => {
      alive = false;
    };
  }, [publishDemo]);
  useEffect(() => {
    if (!client || demo) return;
    const { data: subscription } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setData(empty);
      }
      if (event === 'PASSWORD_RECOVERY')
        location.replace('/ingresar?recovery=1');
    });
    const reload = () => {
      void refresh().catch((e) => setError(rentalError(e)));
    };
    window.addEventListener('focus', reload);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, 60000);
    return () => {
      subscription.subscription.unsubscribe();
      window.removeEventListener('focus', reload);
      clearInterval(timer);
    };
  }, [client, demo, refresh]);
  const href = (path: string) =>
    demo ? path + (path.includes('?') ? '&' : '?') + 'demo=1' : path;
  async function createOrder(input: BookingInput, request: string) {
    if (!user) throw new Error('Inicia sesión para crear la orden.');
    if (demo) {
      const next = structuredClone(dataRef.current);
      const order = demoCreateOrder(next, input, user, request);
      publishDemo(next);
      return order;
    }
    if (!client)
      throw new Error('Las reservas reales todavía no están habilitadas.');
    const order = await createRentalOrder(client, input, request);
    await refresh();
    return order;
  }
  async function action(input: ActionInput) {
    if (!user) throw new Error('Inicia sesión.');
    if (demo) {
      const next = structuredClone(dataRef.current);
      demoAction(next, input, user);
      publishDemo(next);
      return;
    }
    if (!client) throw new Error('Conexión no disponible.');
    await runRentalAction(client, input);
    await refresh();
  }
  async function saveUnit(unit: Omit<RentalUnit, 'id'> & { id?: string }) {
    if (user?.role !== 'admin') throw new Error('Solo administradores.');
    if (demo) {
      if (
        dataRef.current.orders.some(
          (o) =>
            o.unit_id === unit.id && ['approved', 'active'].includes(o.status),
        )
      )
        throw new Error(
          'La unidad tiene alquileres confirmados. Resuelve esas órdenes antes de modificarla.',
        );
      if (
        dataRef.current.units.some(
          (u) =>
            u.id !== unit.id &&
            u.plate.toUpperCase() === unit.plate.toUpperCase(),
        )
      )
        throw new Error('Esta matrícula ya está registrada.');
      const next = structuredClone(dataRef.current),
        value = {
          ...unit,
          id: unit.id || crypto.randomUUID(),
          plate: unit.plate.toUpperCase(),
        };
      next.units = [...next.units.filter((u) => u.id !== unit.id), value];
      publishDemo(next);
      return;
    }
    if (!client) throw new Error('Conexión no disponible.');
    await saveRentalUnit(client, unit);
    await refresh();
  }
  async function setRate(model: string, rate: number) {
    if (
      user?.role !== 'admin' ||
      !Number.isFinite(rate) ||
      rate <= 0 ||
      rate > 10000
    )
      throw new Error('Escribe una tarifa entre 0,01 y 10.000 USD.');
    if (demo) {
      const next = structuredClone(dataRef.current);
      const m = next.models.find((m) => m.id === model);
      if (m) m.daily_rate = rate;
      publishDemo(next);
      return;
    }
    if (!client) throw new Error('Conexión no disponible.');
    const { error } = await client.rpc('rental_set_rate', {
      p_model_id: model,
      p_rate: rate,
    });
    if (error) throw error;
    await refresh();
  }
  async function billingAction(input: BillingInput): Promise<BillingDocument> {
    if (user?.role !== 'admin') throw new Error('Solo administradores.');
    if (demo) {
      const next = structuredClone(dataRef.current);
      const doc = demoBillingAction(next, input);
      publishDemo(next);
      return doc;
    }
    if (!client) throw new Error('Conexión no disponible.');
    const { data: doc, error } = await client.rpc('rental_billing_action', {
      p_input: input,
    });
    if (error) throw error;
    await refresh();
    return doc;
  }
  async function billingSettings(input: BillingSettings) {
    if (user?.role !== 'admin') throw new Error('Solo administradores.');
    if (demo) {
      const next = structuredClone(dataRef.current);
      demoBillingSettings(next, input);
      publishDemo(next);
      return;
    }
    if (!client) throw new Error('Conexión no disponible.');
    const { error } = await client.rpc('rental_billing_settings_save', {
      p_input: input,
    });
    if (error) throw error;
    await refresh();
  }
  const availability = useCallback(
    async (start: string, end: string) => {
      if (demo)
        return Object.fromEntries(
          dataRef.current.models.map((m) => [
            m.id,
            availableUnits(dataRef.current, m.id, start, end).length,
          ]),
        );
      if (!client) return {};
      const { data: counts, error } = await client.rpc('rental_availability', {
        p_pickup: start,
        p_dropoff: end,
      });
      if (error) throw error;
      return Object.fromEntries(
        counts.map((c: { model_id: string; available: number }) => [
          c.model_id,
          Number(c.available),
        ]),
      );
    },
    [client, demo],
  );
  async function logout() {
    if (client && !demo) {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    }
    location.assign('/ingresar');
  }
  const resetDemo = () => {
    publishDemo(ensureBillingData(createDemoData()));
    location.assign('/dashboard?demo=1');
  };
  return (
    <RentalContext
      value={{
        loading,
        configured,
        demo,
        error,
        client,
        user,
        data,
        refresh,
        href,
        createOrder,
        billingAction,
        billingSettings,
        action,
        saveUnit,
        setRate,
        availability,
        logout,
        resetDemo,
      }}
    >
      {children}
    </RentalContext>
  );
}
export function useRental() {
  const value = useContext(RentalContext);
  if (!value) throw new Error('RentalProvider required');
  return value;
}
