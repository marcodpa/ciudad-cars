/* Optimized local WebP images. Native navigation deliberately resets account-bound state. */
/* eslint-disable next/no-img-element, next/no-html-link-for-pages */
'use client';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SubmitEvent,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  MapPin,
  Users,
} from 'lucide-react';
import { useRental } from './rental-provider';
import { useLanguage } from '@/components/language-provider';
import { Calendar } from '@/components/ui/calendar';
import { es, enUS } from 'react-day-picker/locale';
import { calendarDate, calendarValue } from '@/lib/reservation';
import { RentalLoading } from './rental-login';
import { PublicBookingShell } from './public-booking-shell';
import { BookingVerification } from './booking-verification';
import {
  addDays,
  money,
  rentalDays,
  rentalToday,
  validateBooking,
  validateGuestBooking,
  orderMessage,
  shortDate,
  type BookingInput,
  type RentalOrder,
} from '@/lib/rental-domain';
import { demoBooking } from '@/lib/rental-demo';
import { rentalError } from '@/lib/rental-client';
import { whatsappUrl } from '@/lib/company';
import { bookingText } from '@/lib/booking-language';

function BookingContent({
  embedded,
  children,
}: {
  embedded: boolean;
  children: ReactNode;
}) {
  const { demo } = useRental();
  const { language } = useLanguage();
  const text = (spanish: string) => bookingText(language, spanish);
  if (!embedded) return <PublicBookingShell>{children}</PublicBookingShell>;
  return (
    <div className="public-booking">
      {demo && (
        <div className="public-booking-demo">
          <strong>{text('Demostración de la reserva.')}</strong>{' '}
          {text(
            'Usa solo datos de ejemplo. No se crean reservas reales ni se envían mensajes.',
          )}
        </div>
      )}
      <div className="public-booking-content">{children}</div>
    </div>
  );
}
export function RentalBooking({
  embedded = false,
  initialVehicleId,
}: {
  embedded?: boolean;
  initialVehicleId?: string;
}) {
  const { loading, demo, bookingEnabled, error } = useRental();
  const { language } = useLanguage();
  const text = (spanish: string) => bookingText(language, spanish);
  if (loading) return <RentalLoading />;
  if (!demo && !bookingEnabled)
    return (
      <BookingContent embedded={embedded}>
        <section className="rental-card rental-booking-success">
          <h1>{text('Reserva tu próximo carro')}</h1>
          <p>
            {error ||
              text(
                'Estamos habilitando las solicitudes en línea. Por ahora, coordina tu alquiler con nuestro equipo.',
              )}
          </p>
          <a
            className="rental-button"
            href={whatsappUrl(
              'Hola, quiero consultar un alquiler en Ciudad Cars.',
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text('Consultar por WhatsApp')} <ArrowUpRight size={18} />
          </a>
        </section>
      </BookingContent>
    );
  return (
    <RentalBookingForm
      embedded={embedded}
      initialVehicleId={initialVehicleId}
    />
  );
}
function RentalBookingForm({
  embedded,
  initialVehicleId,
}: {
  embedded: boolean;
  initialVehicleId?: string;
}) {
  const { language, t } = useLanguage();
  const text = (spanish: string) => bookingText(language, spanish);
  const { demo, data, availability, createOrder, captchaSitekey } = useRental();
  const [input, setInput] = useState<BookingInput>(() => ({
    ...demoBooking(),
    ...(demo
      ? { email: 'andrea@example.com', phone: '+584120000000' }
      : {
          document: '',
          license: '',
          license_expiry: '',
          full_name: '',
          email: '',
          phone: '',
        }),
    home_address: demo ? 'Maracaibo, sector de ejemplo, calle 10, casa 20' : '',
    pickup_location: 'Por coordinar con Ciudad Cars',
    return_location: 'Por coordinar con Ciudad Cars',
    model_id:
      initialVehicleId ||
      new URLSearchParams(location.search).get('modelo') ||
      'lancer',
    ...(embedded ? { pickup: '', dropoff: '' } : {}),
  }));
  const [captcha, setCaptcha] = useState(''),
    [challenge, setChallenge] = useState(0);
  const [step, setStep] = useState(1),
    [showModels, setShowModels] = useState(!initialVehicleId),
    [counts, setCounts] = useState<Record<string, number>>({}),
    [checking, setChecking] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [created, setCreated] = useState<RentalOrder | null>(null);
  const requests = useRef(new Map<string, string>()),
    heading = useRef<HTMLHeadingElement>(null);
  const model = data.models.find((m) => m.id === input.model_id),
    days = rentalDays(input.pickup, input.dropoff);

  useEffect(() => {
    let alive = true;
    if (!(days > 0 && days <= 90) || input.pickup < rentalToday()) {
      return;
    }
    const timer = setTimeout(
      () =>
        void availability(input.pickup, input.dropoff)
          .then((value) => {
            if (alive) {
              setCounts(value);
              setError('');
            }
          })
          .catch((e) => {
            if (alive) {
              setCounts({});
              setError(rentalError(e));
            }
          })
          .finally(() => {
            if (alive) setChecking(false);
          }),
      150,
    );
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // Availability is fetched when dates/account change, and verified again in the database on submit.
  }, [input.pickup, input.dropoff, demo, days, availability]);
  function update<K extends keyof BookingInput>(
    key: K,
    value: BookingInput[K],
  ) {
    if (key === 'pickup' || key === 'dropoff') {
      setChecking(true);
      setCounts({});
    }
    setInput((old) => ({ ...old, [key]: value }));
    setError('');
  }
  function go(next: number) {
    setStep(next);
    setError('');
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (
        !model ||
        !counts[input.model_id] ||
        checking ||
        days < 1 ||
        days > 90 ||
        input.pickup < rentalToday()
      ) {
        setError(text('Selecciona fechas válidas y un modelo disponible.'));
        return;
      }
      go(2);
      return;
    }
    if (step === 2) {
      try {
        validateBooking({ ...input, consent: true });
        go(3);
      } catch (err) {
        setError(rentalError(err));
      }
      return;
    }
    if (step === 3) {
      try {
        validateGuestBooking({ ...input, consent: true });
        go(4);
      } catch (e) {
        setError(rentalError(e));
      }
      return;
    }
    if (!demo && !captcha) {
      setError(text('Completa la verificación antes de enviar.'));
      return;
    }
    setBusy(true);
    try {
      validateGuestBooking(input);
      const key = JSON.stringify(input);
      if (!requests.current.has(key))
        requests.current.set(key, crypto.randomUUID());
      const order = await createOrder(
        input,
        requests.current.get(key)!,
        captcha,
      );
      setCreated(order);
      if (!demo) {
        // Browsers may block a tab opened after the save request. The link on
        // the confirmation screen remains available in that case.
        window.open(
          whatsappUrl(orderMessage(order, model)),
          '_blank',
          'noopener,noreferrer',
        );
      }
      if (embedded)
        document
          .querySelector('.public-booking-modal')
          ?.scrollTo({ top: 0, behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      setError(rentalError(err));
      setCaptcha('');
      setChallenge((v) => v + 1);
    } finally {
      setBusy(false);
    }
  }
  if (created)
    return (
      <BookingContent embedded={embedded}>
        <section className="rental-card rental-booking-success">
          <span className="rental-success-icon">
            <CheckCircle2 size={44} />
          </span>
          <span className="rental-eyebrow">
            {text(demo ? 'SOLICITUD DE DEMOSTRACIÓN' : 'SOLICITUD GUARDADA')}
          </span>
          <h1>{text('Tu viaje ya tiene un número de orden.')}</h1>
          <strong className="rental-confirmation-code">{created.code}</strong>
          <p>
            {language === 'en'
              ? 'Next, arrange payment on WhatsApp. Your booking is confirmed once Ciudad Cars verifies payment and approves the order.'
              : 'El siguiente paso es coordinar el pago por WhatsApp. Tu reserva quedará confirmada cuando Ciudad Cars verifique el pago y apruebe la orden.'}
          </p>
          <div className="rental-detail-totals">
            <span>
              {language === 'en' ? 'Vehicle' : 'Vehículo'}
              <strong>{model?.model}</strong>
            </span>
            <span>
              {language === 'en' ? 'Dates' : 'Fechas'}
              <strong>
                {shortDate(created.pickup)} — {shortDate(created.dropoff)}
              </strong>
            </span>
            <span>
              {language === 'en' ? 'Total' : 'Total'}
              <strong>{money(created.total)}</strong>
            </span>
          </div>
          {demo ? (
            <div className="rental-notice">
              <strong>{text('Así se verá el mensaje de WhatsApp')}</strong>
              <pre>{orderMessage(created, model)}</pre>
              <p>{text('El envío está desactivado en la demostración.')}</p>
            </div>
          ) : (
            <a
              className="rental-button"
              href={whatsappUrl(orderMessage(created, model))}
              target="_blank"
              rel="noopener noreferrer"
            >
              {text('Continuar por WhatsApp')} <ArrowUpRight size={18} />
            </a>
          )}
          <p className="rental-notice">
            {language === 'en'
              ? 'Keep your order number. Our team will confirm the rental and share documents on WhatsApp.'
              : 'Guarda tu número de orden. El equipo te confirmará el alquiler y te compartirá los documentos por WhatsApp.'}
          </p>
          <a className="rental-button secondary" href="/">
            {text('Volver a la página principal')} <ArrowRight size={18} />
          </a>
        </section>
      </BookingContent>
    );
  return (
    <BookingContent embedded={embedded}>
      <div className="rental-page-heading">
        <div>
          <span className="rental-eyebrow">
            {text('UN NUEVO DESTINO TE ESPERA')}
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {text('Organiza tu próximo viaje.')}
          </h1>
          <p>{text('Reserva en cuatro pasos, sin crear una cuenta.')}</p>
        </div>
      </div>
      <ol
        className="rental-steps"
        aria-label={
          language === 'en' ? 'Booking progress' : 'Progreso de la solicitud'
        }
      >
        {['Carro y fechas', 'Tus datos', 'Domicilio', 'Revisar'].map(
          (label, i) => (
            <li
              key={label}
              className={
                step === i + 1 ? 'current' : step > i + 1 ? 'done' : ''
              }
              aria-current={step === i + 1 ? 'step' : undefined}
            >
              <span>{step > i + 1 ? <Check size={16} /> : i + 1}</span>
              {text(label)}
            </li>
          ),
        )}
      </ol>
      <form
        className={`rental-booking-grid booking-step-${step}`}
        onSubmit={submit}
      >
        <section className="rental-card rental-form rental-booking-main">
          {step === 1 && (
            <>
              <h2>{text('¿Cuándo comienza tu viaje?')}</h2>
              <p>
                {text(
                  'Marca en el calendario el día de retiro y después el de devolución.',
                )}
              </p>
              <div className="rental-booking-calendar">
                <Calendar
                  mode="range"
                  min={1}
                  excludeDisabled
                  locale={language === 'en' ? enUS : es}
                  labels={{
                    labelPrevious: () =>
                      language === 'en' ? 'Previous month' : 'Mes anterior',
                    labelNext: () =>
                      language === 'en' ? 'Next month' : 'Mes siguiente',
                  }}
                  selected={{
                    from: calendarDate(input.pickup),
                    to: calendarDate(input.dropoff),
                  }}
                  onSelect={(range) => {
                    update('pickup', calendarValue(range?.from));
                    update('dropoff', calendarValue(range?.to));
                  }}
                  startMonth={calendarDate(rentalToday())}
                  disabled={{ before: calendarDate(rentalToday())! }}
                  showOutsideDays={false}
                  fixedWeeks
                  aria-label={
                    language === 'en'
                      ? 'Choose pickup and return dates'
                      : 'Elige las fechas de retiro y devolución'
                  }
                />
              </div>
              <div className="rental-form-grid">
                <label>
                  {text('Fecha de retiro')}
                  <input
                    type="date"
                    value={input.pickup}
                    min={rentalToday()}
                    required
                    onChange={(e) => update('pickup', e.target.value)}
                  />
                </label>
                <label>
                  {text('Fecha de devolución')}
                  <input
                    type="date"
                    value={input.dropoff}
                    min={addDays(input.pickup || rentalToday(), 1)}
                    required
                    onChange={(e) => update('dropoff', e.target.value)}
                  />
                </label>
              </div>
              <div className="rental-card-heading">
                <h2>{text(showModels ? 'Elige tu carro' : 'Tu carro')}</h2>
                <output className="rental-small">
                  {!(days > 0 && days <= 90) || input.pickup < rentalToday()
                    ? text(
                        'Elige una devolución posterior al retiro (hasta 90 días).',
                      )
                    : checking
                      ? text('Consultando disponibilidad…')
                      : text('Disponibilidad para tus fechas')}
                </output>
              </div>
              {!showModels && model && (
                <div className="rental-selected-car">
                  <img
                    src={model.image}
                    width="160"
                    height="90"
                    alt={`${model.make} ${model.model}`}
                  />
                  <div>
                    <strong>
                      {model.make} {model.model}
                    </strong>
                    <span>
                      {checking
                        ? text('Consultando disponibilidad…')
                        : counts[model.id]
                          ? `${counts[model.id]} ${text(counts[model.id] === 1 ? 'unidad disponible' : 'unidades disponibles')}`
                          : text(
                              'Selecciona fechas para consultar disponibilidad',
                            )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rental-text-button"
                    onClick={() => setShowModels(true)}
                  >
                    {text('Cambiar carro')}
                  </button>
                </div>
              )}
              {showModels && (
                <div className="rental-booking-cars">
                  {data.models.map((m) => {
                    const count = counts[m.id] || 0;
                    return (
                      <label
                        key={m.id}
                        className={
                          'rental-car-option ' +
                          (input.model_id === m.id ? 'chosen' : '') +
                          (!count ? ' unavailable' : '')
                        }
                      >
                        <input
                          type="radio"
                          name="model"
                          value={m.id}
                          checked={input.model_id === m.id}
                          onChange={() => update('model_id', m.id)}
                          disabled={!count || checking}
                        />
                        <img
                          src={m.image}
                          width="1008"
                          height="567"
                          alt={m.make + ' ' + m.model}
                          loading="lazy"
                        />
                        <div>
                          <span>{t(m.category)}</span>
                          <strong>
                            {m.make} {m.model}
                          </strong>
                          <small>
                            <Users size={14} /> {m.seats}{' '}
                            {language === 'en'
                              ? 'seats · Automatic'
                              : 'puestos · Automático'}
                          </small>
                          <p>
                            <b>{money(m.daily_rate)}</b> /{' '}
                            {language === 'en' ? 'day' : 'día'}
                          </p>
                          <span
                            className={
                              'rental-availability ' + (count ? '' : 'none')
                            }
                          >
                            {checking
                              ? text('Consultando…')
                              : count
                                ? `${count} ${text(count === 1 ? 'unidad disponible' : 'unidades disponibles')}`
                                : text('No disponible')}
                          </span>
                        </div>
                        <span className="rental-car-radio">
                          {input.model_id === m.id && <Check size={14} />}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h2>{text('Datos del conductor')}</h2>
              <p>
                {text(
                  'Usaremos estos datos para gestionar tu solicitud y preparar el alquiler.',
                )}
              </p>
              <div className="rental-form-grid">
                <label className="wide">
                  {text('Nombre completo')}
                  <input
                    value={input.full_name}
                    required
                    minLength={3}
                    maxLength={120}
                    autoComplete="name"
                    onChange={(e) => update('full_name', e.target.value)}
                  />
                </label>
                <label>
                  {text('Teléfono / WhatsApp')}
                  <input
                    type="tel"
                    value={input.phone}
                    required
                    maxLength={25}
                    autoComplete="tel"
                    placeholder="+58 412 1234567"
                    onChange={(e) => update('phone', e.target.value)}
                  />
                </label>
                <label>
                  {text('Correo electrónico')}
                  <input
                    type="email"
                    value={input.email}
                    required
                    maxLength={254}
                    autoComplete="email"
                    onChange={(e) => update('email', e.target.value)}
                  />
                </label>
                <label>
                  {text('Cédula o pasaporte')}
                  <input
                    value={input.document}
                    required
                    minLength={4}
                    maxLength={40}
                    onChange={(e) => update('document', e.target.value)}
                  />
                </label>
                <label>
                  {text('Número de licencia')}
                  <input
                    value={input.license}
                    required
                    minLength={4}
                    maxLength={40}
                    onChange={(e) => update('license', e.target.value)}
                  />
                </label>
                <label>
                  {text('Vencimiento de la licencia')}
                  <input
                    type="date"
                    value={input.license_expiry}
                    min={input.dropoff}
                    required
                    onChange={(e) => update('license_expiry', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2>{text('¿Dónde vives?')}</h2>
              <p>
                {text(
                  'Escribe tu dirección de domicilio. El punto de retiro y devolución del carro se coordina por WhatsApp.',
                )}
              </p>
              <div className="rental-form-grid">
                <label className="wide">
                  {text('Dirección de domicilio')}
                  <textarea
                    value={input.home_address || ''}
                    required
                    minLength={8}
                    maxLength={500}
                    rows={4}
                    autoComplete="street-address"
                    placeholder={
                      language === 'en'
                        ? 'City, neighbourhood, street, building or house and number'
                        : 'Ciudad, sector, calle o avenida, edificio o casa y número'
                    }
                    onChange={(e) => update('home_address', e.target.value)}
                  />
                </label>
                <label className="wide">
                  {text('Notas para tu viaje')}{' '}
                  <small>{text('(opcional)')}</small>
                  <textarea
                    rows={3}
                    value={input.notes}
                    maxLength={1000}
                    placeholder={
                      language === 'en'
                        ? 'Preferred time, flight number or instructions…'
                        : 'Horario preferido, número de vuelo o alguna indicación…'
                    }
                    onChange={(e) => update('notes', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h2>{text('Todo listo para crear tu orden')}</h2>
              <p>
                {text(
                  'Revisa tus datos. La solicitud se guardará antes de abrir WhatsApp.',
                )}
              </p>
              <dl className="rental-review">
                <dt>{text('Conductor')}</dt>
                <dd>{input.full_name}</dd>
                <dt>{text('Contacto')}</dt>
                <dd>
                  {input.phone}
                  <br />
                  {input.email}
                </dd>
                <dt>{text('Cédula o pasaporte')}</dt>
                <dd>{input.document}</dd>
                <dt>{text('Domicilio')}</dt>
                <dd>{input.home_address}</dd>
                <dt>{text('Retiro')}</dt>
                <dd>
                  {input.pickup}
                  <br />
                  {text(input.pickup_location)}
                </dd>
                <dt>{text('Devolución')}</dt>
                <dd>
                  {input.dropoff}
                  <br />
                  {text(input.return_location)}
                </dd>
                <dt>{text('Licencia')}</dt>
                <dd>
                  {input.license} ·{' '}
                  {language === 'en' ? 'Valid until' : 'Vigente hasta'}{' '}
                  {input.license_expiry}
                </dd>
                {input.notes && (
                  <>
                    <dt>{language === 'en' ? 'Notes' : 'Notas'}</dt>
                    <dd>{input.notes}</dd>
                  </>
                )}
              </dl>
              <div className="rental-notice">
                <strong>{text('¿Qué pasa después?')}</strong>
                <p>
                  {text(
                    'Coordinas el pago por WhatsApp. El equipo lo verifica, asigna un vehículo disponible y confirma tu orden. Hasta entonces, las fechas no están bloqueadas.',
                  )}
                </p>
              </div>
              {!demo && (
                <BookingVerification
                  key={challenge}
                  sitekey={captchaSitekey}
                  onToken={setCaptcha}
                />
              )}
              <label className="rental-checkbox">
                <input
                  type="checkbox"
                  checked={input.consent}
                  required
                  onChange={(e) => update('consent', e.target.checked)}
                />
                <span>
                  {text(
                    'Confirmo que los datos son correctos y autorizo a Ciudad Cars a usarlos para gestionar esta solicitud y contactarme. Entiendo que la reserva requiere aprobación.',
                  )}
                </span>
              </label>
            </>
          )}
          {error && (
            <p className="rental-error" role="alert">
              {error}
            </p>
          )}
          <div className="rental-booking-actions">
            {step > 1 && (
              <button
                type="button"
                className="rental-button secondary"
                onClick={() => go(step - 1)}
                disabled={busy}
              >
                <ArrowLeft size={16} /> {text('Atrás')}
              </button>
            )}
            <button
              className="rental-button"
              disabled={
                busy ||
                (step === 1 && (checking || !counts[input.model_id])) ||
                (step === 4 && !demo && !captcha)
              }
            >
              {busy
                ? text('Guardando tu orden…')
                : step === 4
                  ? text('Crear orden y continuar')
                  : text('Continuar')}
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
        <aside className="rental-card rental-booking-summary">
          <span className="rental-eyebrow">{text('TU VIAJE')}</span>
          {model && (
            <>
              <img
                src={model.image}
                width="1008"
                height="567"
                alt={model.model}
              />
              <h2>
                {model.make} <br />
                {model.model}
              </h2>
              <span>
                {t(model.category)} · {model.seats}{' '}
                {language === 'en' ? 'seats' : 'puestos'}
              </span>
            </>
          )}
          <div>
            <p>
              <CalendarDays size={18} />
              <span>
                {input.pickup && shortDate(input.pickup)} —{' '}
                {input.dropoff && shortDate(input.dropoff)}
                <small>
                  {Number.isFinite(days) && days > 0 ? days : 0}{' '}
                  {language === 'en' ? 'rental days' : 'días de alquiler'}
                </small>
              </span>
            </p>
            <p>
              <MapPin size={18} />
              <span>{text(input.pickup_location)}</span>
            </p>
          </div>
          <dl>
            <dt>{text('Tarifa diaria')}</dt>
            <dd>{money(model?.daily_rate || 0)}</dd>
            <dt>{text('Total del alquiler')}</dt>
            <dd className="rental-summary-total">
              {money(
                (model?.daily_rate || 0) *
                  (Number.isFinite(days) && days > 0 ? days : 0),
              )}
            </dd>
          </dl>
          <small>
            {text(
              'Pago coordinado por WhatsApp. La solicitud no confirma la reserva ni realiza un cobro.',
            )}
          </small>
        </aside>
      </form>
    </BookingContent>
  );
}
