/* Optimized local brand asset; native navigation resets account state. */
/* eslint-disable next/no-img-element, next/no-html-link-for-pages */
'use client';
import { useState, type SubmitEvent } from 'react';
import { ArrowRight, ArrowUpRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useRental } from './rental-provider';
import { useBrowserSearch } from './use-browser-search';
import { formText } from '@/lib/rental-domain';
import { rentalError, fetchRentalProfile } from '@/lib/rental-client';
export function RentalBrand() {
  return (
    <a
      href="/"
      className="rental-brand"
      aria-label="Ciudad Cars, volver al inicio"
    >
      <img
        src="/images/logo-transparent.png"
        width="427"
        height="74"
        alt="Ciudad Cars"
      />
    </a>
  );
}
export function RentalLoading() {
  return (
    <main id="contenido" className="rental-loading" aria-live="polite">
      <span className="rental-spinner" /> Preparando tu espacio…
    </main>
  );
}

export function RentalLogin() {
  const {
    loading,
    configured,
    client,
    user,
    error: connectionError,
    href,
    logout,
  } = useRental();
  const [selectedMode, setMode] = useState<'login' | 'reset'>('login'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const search = useBrowserSearch(),
    mode =
      new URLSearchParams(search).get('recovery') === '1'
        ? 'password'
        : selectedMode;
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!client) return;
    setBusy(true);
    setError('');
    setNotice('');
    const f = new FormData(e.currentTarget);
    try {
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(
          formText(f, 'email'),
          { redirectTo: location.origin + '/ingresar?recovery=1' },
        );
        if (error) throw error;
        setNotice(
          'Si el correo pertenece al equipo, recibirás un enlace para recuperar el acceso.',
        );
      } else if (mode === 'password') {
        const profile = await fetchRentalProfile(client);
        if (profile?.role !== 'admin')
          throw new Error(
            'Este acceso está reservado al equipo de Ciudad Cars.',
          );
        const { error } = await client.auth.updateUser({
          password: formText(f, 'password'),
        });
        if (error) throw error;
        location.assign('/dashboard');
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: formText(f, 'email'),
          password: formText(f, 'password'),
        });
        if (error) throw error;
        const profile = await fetchRentalProfile(client);
        if (profile?.role !== 'admin') {
          await client.auth.signOut();
          throw new Error(
            'Este acceso es solo para el equipo. Puedes reservar desde la página principal sin cuenta.',
          );
        }
        location.assign('/dashboard');
      }
    } catch (e) {
      setError(rentalError(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <RentalLoading />;
  return (
    <main className="rental-app rental-login" id="contenido">
      <section className="rental-login-story">
        <RentalBrand />
        <div>
          <span className="rental-eyebrow">CIUDAD CARS · OPERACIONES</span>
          <h1>
            Tu flota.
            <br />
            Todo bajo control.
          </h1>
          <p>
            Gestiona disponibilidad, solicitudes, pagos y facturas desde un solo
            lugar.
          </p>
        </div>
        <a href="/">
          Volver a la página principal <ArrowUpRight size={18} />
        </a>
      </section>
      <section className="rental-login-main">
        <div className="rental-login-card">
          <span className="rental-login-icon">
            <KeyRound size={24} />
          </span>
          <h2>
            {mode === 'reset'
              ? 'Recuperar acceso'
              : mode === 'password'
                ? 'Nueva contraseña'
                : 'Acceso del equipo'}
          </h2>
          <p>Los clientes reservan desde la web, sin registro ni panel.</p>
          {connectionError && (
            <p className="rental-error" role="alert">
              {connectionError}
            </p>
          )}
          {!configured ? (
            <div className="rental-setup">
              <strong>Prueba el sistema de Ciudad Cars</strong>
              <p>
                La base de datos todavía no está conectada. Puedes recorrer la
                demostración con datos de ejemplo.
              </p>
              <a className="rental-button" href="/dashboard?demo=1">
                Explorar administración <ArrowRight size={18} />
              </a>
              <a className="rental-button secondary" href="/reservar?demo=1">
                Probar reserva pública
              </a>
            </div>
          ) : user?.role === 'admin' && mode !== 'password' ? (
            <div className="rental-stack">
              <p>Sesión iniciada como {user.full_name || user.email}.</p>
              <a className="rental-button" href={href('/dashboard')}>
                Ir a administración <ArrowRight size={18} />
              </a>
              <button
                className="rental-button secondary"
                onClick={() =>
                  void logout().catch((e) => setError(rentalError(e)))
                }
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <form className="rental-form" onSubmit={submit}>
              {mode !== 'password' && (
                <label>
                  Correo del equipo
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                  />
                </label>
              )}
              {mode !== 'reset' && (
                <label>
                  Contraseña
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={mode === 'password' ? 12 : 1}
                    autoComplete={
                      mode === 'password' ? 'new-password' : 'current-password'
                    }
                  />
                  {mode === 'password' && (
                    <small>Usa al menos 12 caracteres.</small>
                  )}
                </label>
              )}
              {error && (
                <p className="rental-error" role="alert">
                  {error}
                </p>
              )}
              {notice && <output className="rental-success">{notice}</output>}
              <button className="rental-button" disabled={busy}>
                {busy
                  ? 'Un momento…'
                  : mode === 'reset'
                    ? 'Enviar enlace'
                    : mode === 'password'
                      ? 'Guardar contraseña'
                      : 'Ingresar a administración'}
                <ArrowRight size={18} />
              </button>
              {mode !== 'password' && (
                <button
                  type="button"
                  className="rental-text-button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'reset' : 'login');
                    setError('');
                    setNotice('');
                  }}
                >
                  {mode === 'login'
                    ? 'Olvidé mi contraseña'
                    : 'Volver al ingreso'}
                </button>
              )}
            </form>
          )}
          <div className="rental-login-benefits">
            <span>
              <ShieldCheck size={18} /> Acceso reservado a administradores
            </span>
          </div>
          <a href="/reservar" className="rental-text-button">
            ¿Quieres alquilar? Reserva sin cuenta <ArrowUpRight size={16} />
          </a>
        </div>
        <p className="rental-small">Ciudad Cars · Car Rentals</p>
      </section>
    </main>
  );
}
