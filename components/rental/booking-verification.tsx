'use client';
import { useEffect, useRef, useState } from 'react';
type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
export function BookingVerification({
  sitekey,
  onToken,
}: {
  sitekey: string;
  onToken: (token: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let widget: string | undefined,
      alive = true;
    function render() {
      if (!alive || !node.current || !window.turnstile) return;
      widget = window.turnstile.render(node.current, {
        sitekey,
        action: 'booking',
        size: 'compact',
        theme: 'light',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => {
          onToken('');
          setError('No se pudo cargar la verificación. Intenta nuevamente.');
        },
      });
    }
    function fail() {
      if (alive)
        setError('No se pudo cargar la verificación. Revisa tu conexión.');
    }
    let script = document.querySelector<HTMLScriptElement>('#cc-turnstile');
    if (window.turnstile) render();
    else {
      if (!script) {
        script = document.createElement('script');
        script.id = 'cc-turnstile';
        script.src =
          'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', render);
      script.addEventListener('error', fail);
    }
    return () => {
      alive = false;
      script?.removeEventListener('load', render);
      script?.removeEventListener('error', fail);
      if (widget) window.turnstile?.remove(widget);
    };
  }, [sitekey, onToken, retry]);
  return (
    <div className="booking-verification">
      <div ref={node} />
      {error && (
        <p className="rental-error" role="alert">
          {error}{' '}
          <button
            type="button"
            onClick={() => {
              document.querySelector('#cc-turnstile')?.remove();
              setError('');
              setRetry((v) => v + 1);
            }}
          >
            Reintentar
          </button>
        </p>
      )}
    </div>
  );
}
