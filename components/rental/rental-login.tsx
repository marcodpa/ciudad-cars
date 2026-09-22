/* Optimized local WebP images. Native navigation deliberately resets account-bound state. */
/* eslint-disable next/no-img-element, next/no-html-link-for-pages */
'use client';
import { useState, type SubmitEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useRental } from './rental-provider';
import { useBrowserSearch } from './use-browser-search';
import { formText } from '@/lib/rental-domain';
import { rentalError } from '@/lib/rental-client';

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
  const [selectedMode, setMode] = useState<
      'login' | 'signup' | 'reset' | 'password'
    >('login'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const search = useBrowserSearch();
  const mode =
    new URLSearchParams(search).get('recovery') === '1'
      ? 'password'
      : selectedMode;
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget),
      email = formText(form, 'email'),
      password = formText(form, 'password');
    try {
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + '/ingresar?recovery=1',
        });
        if (error) throw error;
        setNotice(
          'Si el correo está registrado, recibirás un enlace para recuperar tu cuenta.',
        );
      } else if (mode === 'password') {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        location.assign('/dashboard');
      } else if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: formText(form, 'name') },
            emailRedirectTo: location.origin + '/ingresar',
          },
        });
        if (error) throw error;
        if (data.session) location.assign('/dashboard');
        else
          setNotice(
            'Revisa tu correo y confirma tu cuenta. Después podrás ingresar y crear tu orden.',
          );
      } else {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const next =
          new URLSearchParams(location.search).get('next') ||
          (location.pathname === '/reservar'
            ? location.pathname + location.search
            : '');
        location.assign(
          next.startsWith('/reservar') && !next.includes('//')
            ? next
            : '/dashboard',
        );
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
          <span className="rental-eyebrow">TU DESTINO. NUESTRA RUTA.</span>
          <h1>
            Tu próximo viaje
            <br />
            <em>empieza aquí.</em>
          </h1>
          <p>
            Elige tu carro, organiza tus fechas y lleva el control de tu
            alquiler en un solo lugar.
          </p>
          <div className="rental-login-photo">
            <img
              src="/images/fleet-photo-cruze-mobile.webp"
              alt="Chevrolet Cruze en Maracaibo"
              width="1008"
              height="567"
            />
            <span>Muévete a tu ritmo.</span>
          </div>
        </div>
        <p className="rental-login-foot">
          Maracaibo, Venezuela <span>Desde 1984</span>
        </p>
      </section>
      <section className="rental-login-panel">
        <a className="rental-back" href="/">
          Volver a la web <ArrowUpRight size={16} />
        </a>
        <div className="rental-login-form">
          <span className="rental-icon-box">
            <KeyRound size={24} />
          </span>
          <h2>
            {mode === 'signup'
              ? 'Crea tu cuenta'
              : mode === 'reset'
                ? 'Recupera tu acceso'
                : mode === 'password'
                  ? 'Nueva contraseña'
                  : 'Bienvenido de vuelta'}
          </h2>
          <p>Tu cuenta, tus órdenes y todos los detalles del viaje.</p>
          {connectionError && (
            <p role="alert" className="rental-error">
              {connectionError}{' '}
              <button onClick={() => location.reload()}>Reintentar</button>
            </p>
          )}
          {!configured && !connectionError ? (
            <div className="rental-setup">
              <strong>Conoce el nuevo sistema</strong>
              <p>
                Estamos preparando las cuentas y reservas en línea. Mientras
                tanto, puedes recorrer una demostración con datos de ejemplo.
              </p>
              <a className="rental-button" href="/dashboard?demo=1&role=admin">
                Explorar panel de administración <ArrowRight size={18} />
              </a>
              <a
                className="rental-button secondary"
                href="/dashboard?demo=1&role=customer"
              >
                Ver experiencia del cliente
              </a>
              <small>
                La demostración no crea reservas reales ni envía mensajes.
              </small>
            </div>
          ) : user && mode !== 'password' ? (
            <div className="rental-stack">
              <p>
                Sesión iniciada como{' '}
                <strong>{user.full_name || user.email}</strong>.
              </p>
              <a className="rental-button" href={href('/dashboard')}>
                Ir a mi panel <ArrowRight size={18} />
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
          ) : configured ? (
            <form onSubmit={submit} className="rental-form">
              {mode === 'signup' && (
                <label>
                  Nombre completo
                  <input
                    name="name"
                    required
                    minLength={3}
                    maxLength={120}
                    autoComplete="name"
                  />
                </label>
              )}
              {mode !== 'password' && (
                <label>
                  Correo electrónico
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
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
                    minLength={mode === 'login' ? 1 : 12}
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                  />
                  {mode !== 'login' && (
                    <small>Usa al menos 12 caracteres.</small>
                  )}
                </label>
              )}
              {mode === 'login' && (
                <button
                  type="button"
                  className="rental-text-button"
                  onClick={() => {
                    setMode('reset');
                    setError('');
                    setNotice('');
                  }}
                >
                  Olvidé mi contraseña
                </button>
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
                  : mode === 'login'
                    ? 'Ingresar'
                    : mode === 'signup'
                      ? 'Crear cuenta'
                      : mode === 'reset'
                        ? 'Enviar enlace'
                        : 'Guardar contraseña'}
                <ArrowRight size={18} />
              </button>
              {mode !== 'password' && (
                <button
                  type="button"
                  className="rental-text-button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                    setNotice('');
                  }}
                >
                  {mode === 'login'
                    ? '¿Primera vez? Crea tu cuenta'
                    : 'Ya tengo cuenta. Ingresar'}
                </button>
              )}
            </form>
          ) : null}
          <div className="rental-login-benefits">
            <span>
              <CalendarDays size={18} /> Fechas y disponibilidad
            </span>
            <span>
              <Check size={18} /> Seguimiento de tu orden
            </span>
            <span>
              <ShieldCheck size={18} /> Pago coordinado por WhatsApp
            </span>
          </div>
        </div>
        <p className="rental-small">Ciudad Cars · Car Rentals</p>
      </section>
    </main>
  );
}
