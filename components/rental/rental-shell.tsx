/* Optimized local WebP images. Native navigation deliberately resets account-bound state. */
/* eslint-disable next/no-img-element, next/no-html-link-for-pages */
'use client';
import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  LayoutDashboard,
  CalendarDays,
  CarFront,
  ClipboardList,
  Users,
  Wallet,
  Settings2,
  LogOut,
} from 'lucide-react';
import { RentalBrand } from './rental-login';
import { useRental } from './rental-provider';
export const rentalViews = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'orders', label: 'Órdenes', icon: ClipboardList },
  { id: 'calendar', label: 'Disponibilidad', icon: CalendarDays },
  { id: 'fleet', label: 'Flota', icon: CarFront },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'payments', label: 'Pagos', icon: Wallet },
  { id: 'settings', label: 'Configuración', icon: Settings2 },
];
export function RentalShell({
  children,
  view = 'overview',
}: {
  children: ReactNode;
  view?: string;
}) {
  const { user, demo, href, logout } = useRental();
  const admin = user?.role === 'admin';
  return (
    <div className="rental-app rental-shell">
      <aside className="rental-sidebar">
        <RentalBrand />
        <span className="rental-sidebar-label">
          {admin ? 'CENTRO DE OPERACIONES' : 'MI ESPACIO'}
        </span>
        <nav aria-label="Panel de alquileres">
          {rentalViews
            .filter((v) => admin || ['overview', 'orders'].includes(v.id))
            .map((v) => (
              <a
                key={v.id}
                href={href('/dashboard?view=' + v.id)}
                className={view === v.id ? 'selected' : ''}
                aria-current={view === v.id ? 'page' : undefined}
              >
                <v.icon size={19} aria-hidden="true" />
                {v.label === 'Órdenes' && !admin ? 'Mis órdenes' : v.label}
                {v.id === 'overview' && <span className="rental-nav-dot" />}
              </a>
            ))}
        </nav>
        <div className="rental-sidebar-bottom">
          <a href="/">
            Ver página web <ArrowUpRight size={16} />
          </a>
          <div className="rental-user">
            <span>{user?.full_name.slice(0, 1) || 'C'}</span>
            <div>
              <strong>{user?.full_name || 'Mi cuenta'}</strong>
              <small>{admin ? 'Administrador' : 'Cliente'}</small>
            </div>
            <button
              aria-label="Cerrar sesión"
              onClick={() =>
                void logout().catch(() => location.assign('/ingresar'))
              }
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="rental-workspace">
        <header className="rental-topbar">
          <span>
            Ciudad Cars{' '}
            <span className="rental-breadcrumb">
              / {admin ? 'Administración' : 'Mi cuenta'}
            </span>
          </span>
          <div className="rental-inline">
            <a className="rental-button compact" href={href('/reservar')}>
              + Nueva solicitud
            </a>
            <button
              className="rental-icon-button rental-mobile-logout"
              aria-label="Cerrar sesión"
              onClick={() =>
                void logout().catch(() => location.assign('/ingresar'))
              }
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        {demo && (
          <div className="rental-demo-banner">
            <div>
              <strong>Demostración</strong> Datos de ejemplo en este navegador.
              No crea reservas ni envía mensajes. No ingreses datos reales.
            </div>
            <a
              href={
                href('/dashboard') + '&role=' + (admin ? 'customer' : 'admin')
              }
            >
              Ver como {admin ? 'cliente' : 'administrador'}{' '}
              <ArrowUpRight size={14} />
            </a>
          </div>
        )}
        <main id="contenido" className="rental-content">
          {children}
        </main>
      </div>
    </div>
  );
}
