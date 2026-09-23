# Sistema de alquileres de Ciudad Cars

## Reserva pública, sin cuentas de clientes

Los botones «Reservar ahora» del encabezado, inicio y catálogo abren una ventana sobre la misma página pública. La ventana empieza con un calendario para marcar retiro y devolución. Cuando el cliente llega desde un carro, aparece ese modelo seleccionado; desde el encabezado puede elegir entre todos. No se entra al panel ni se inicia sesión. Los enlaces antiguos `/reservar?modelo=...` redirigen al catálogo y abren la misma ventana con el modelo conservado. El cliente completa cuatro pasos:

1. Carro y fechas: modelos y conteos de disponibilidad para el período elegido.
2. Datos personales: nombre completo, teléfono/WhatsApp, correo, número de cédula o pasaporte, número y vencimiento de licencia. No se adjuntan fotos.
3. Domicilio: dirección de donde vive (ciudad, sector, calle y número), más observaciones opcionales. Retiro y devolución se coordinan con el equipo.
4. Revisión, consentimiento para gestionar los datos y verificación contra envíos automatizados. Se guarda la orden antes de ofrecer el enlace de WhatsApp.

El mensaje lleva el número de orden y el resumen del viaje; no incluye el domicilio, cédula ni licencia. El cliente conserva su número y coordina pago, confirmación, cambios y documentos con el equipo. No hay registro, inicio de sesión ni panel para clientes.

`/ingresar` es exclusivo del equipo: ingreso y recuperación de contraseña. `/dashboard` exige un administrador verificado en la base, también para lecturas directas por API. Administración mantiene órdenes, pagos, disponibilidad, flota, contactos comerciales y facturación. Los contactos no son cuentas de acceso.

## Calendario para flotas grandes

Las vistas de mes y semana muestran conteos diarios de vehículos disponibles, ocupados y fuera de servicio. Seleccionar un día abre el detalle: unidades, entregas/devoluciones, solicitudes pendientes y atrasos actuales. Incluye filtros por modelo, búsqueda de matrícula/nombre y resumen desplegable por modelo. El detalle muestra 20 filas por página; nunca genera una tabla con todos los vehículos por cada día. El cálculo se prueba con 2.000 unidades.

Los conteos representan la planificación según el estado actual de órdenes y unidades, no un informe histórico de ocupación. Los pendientes no bloquean inventario. Las devoluciones atrasadas bloquean la unidad hasta registrar su regreso y avisan de conflictos con reservas futuras.

## Demostración

`/vehiculos?reservar=1&demo=1` y `/dashboard?view=calendar&demo=1` permiten probar el recorrido con datos ficticios. Si falta Supabase, la ventana de reserva abre esta demostración con un aviso visible. Nunca introducir información real: los ejemplos se guardan en `sessionStorage`, no se sincronizan entre dispositivos y no crean reservas ni mensajes reales. Configuración permite restablecerlos. La primera entrega se publica como preview para revisar antes de sustituir producción.

## Conectar el servicio real

1. Crear el proyecto Supabase. Aplicar en orden las cuatro migraciones de `supabase/migrations`, terminando con `202609230001_audit_trail.sql`. Son transaccionales y se ejecutan una sola vez; en una instalación existente, aplicar únicamente las pendientes. La tercera conserva los datos antiguos y retira el acceso de cuentas de cliente. La cuarta agrega fechas y el historial de cambios. Ver el mapa y las verificaciones en `docs/database-supabase.md`.
2. Configurar las variables de `supabase/environment.example` en Vercel y volver a desplegar. En desarrollo usar `.env.local`, ignorado por Git. URL y clave publicable pueden llegar al navegador. La clave secreta de Supabase y la de Turnstile son exclusivamente del servidor: nunca usar el prefijo `NEXT_PUBLIC_` para ellas, ni subirlas a Git.
3. Crear un widget Cloudflare Turnstile y autorizar los dominios exactos de la app, incluidos los previews que se vayan a probar. Configurar sus claves pública y privada. La app valida el token en servidor, el hostname y la acción `booking`; sin las claves no admite reservas reales.
4. Deshabilitar registros públicos en Supabase Auth. Crear la cuenta del propietario desde el panel de Supabase y confirmar su correo. Configurar Email/Password, contraseña mínima de 12 caracteres y servicio de correo. Registrar la URL de la app y las redirecciones exactas `/ingresar` y `/ingresar?recovery=1` (también localhost cuando corresponda).
5. Promover solo la cuenta concreta del propietario desde el editor SQL, después de verificar su dirección:

   ```sql
   update public.rental_profiles set role = 'admin'
   where auth_user_id = (
     select id from auth.users
     where email = 'CORREO-DEL-PROPIETARIO'
       and email_confirmed_at is not null
   ) returning id, email, role;
   ```

   El alta de Auth nunca concede permisos de administrador por metadatos. Repetir únicamente para miembros autorizados del equipo.
6. Ingresar como administrador, registrar las unidades reales con matrícula y revisar tarifas. Las migraciones añaden modelos, no inventario disponible. Configurar los datos comerciales de facturación siguiendo `docs/billing-system.md`.
7. Probar una reserva anónima completa, acceso administrativo, pago verificado, aprobación/asignación, entrega, devolución y factura. Comprobar correo de recuperación y Turnstile en el dominio final. Configurar copias de seguridad antes de activar producción.

Referencias: [claves de Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [validación de Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Reglas operativas

- USD; alquiler diario de 1 a 90 días, fecha de Caracas. El operador verifica pagos externamente y registra su referencia; no hay cobro automático ni API de WhatsApp.
- Pendientes no retienen unidades. Aprobar exige pago completo y disponibilidad comprobada de nuevo; PostgreSQL impide solapamientos en una unidad, incluso con solicitudes concurrentes.
- Períodos `[retiro, devolución)`: el día de devolución permite otro alquiler. No incluye horas ni margen de limpieza configurable. Un alquiler atrasado sigue bloqueando su unidad.
- Solo el equipo cancela y cambia estados. Cancelar con saldo a favor indica lo pendiente por reembolsar; no devuelve dinero automáticamente. Cambios de fechas requieren cancelar y crear otra orden, conservando el historial.
- Mantenimiento/inactivación excluye unidades disponibles; no se modifica una unidad con alquileres confirmados o activos sin resolverlos.
- Precios y totales se calculan en servidor y se conservan por orden. El catálogo público mantiene tarifas informativas; revisar también `lib/fleet.ts` al cambiar precios de marca.
- Facturas, notas, pagos y reembolsos comparten saldos. No incluye emisión fiscal autorizada, depósitos de garantía contables, firma digital, adjuntos ni reconocimiento automático de pagos.
- Operaciones y formulario están en español; el sitio comercial conserva ES/EN. Las rutas operativas y el formulario tienen `noindex` y no figuran en el sitemap.

## Seguridad y validación

La reserva pública lee únicamente modelos y conteos agregados. El servidor comprueba origen, tamaño, campos y Turnstile antes de invocar la función exclusiva de su clave secreta. RLS limita órdenes, contactos, pagos, historial y facturas al equipo. Las antiguas funciones de creación para clientes están revocadas y las cuentas antiguas tampoco pueden cancelar órdenes.

La creación tiene reintentos sin duplicados y límites transaccionales: cinco solicitudes por origen de red en quince minutos, veinte al día y cinco pendientes por contacto. Los límites de red almacenan un HMAC, no la IP original. Cambiar la clave secreta cambia esos identificadores y reinicia su agrupación; las órdenes conservan sus datos. No se persisten borradores reales ni información personal del formulario en el almacenamiento del navegador.

`npm test` verifica dominio, API y las migraciones en PostgreSQL embebido (PGlite): permisos, precios, privacidad, reintentos, límites, pagos, solapamientos y facturación. No sustituye la prueba contra el proyecto Supabase y Turnstile reales, que aún deben conectarse. El panel obtiene todas las colecciones mediante paginación de red; para volúmenes mayores conviene trasladar también las agregaciones al servidor.
