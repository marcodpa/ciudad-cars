# Sistema de alquileres de Ciudad Cars

## Recorrido disponible

- `/ingresar`: registro por correo y contraseña, confirmación del correo, ingreso, recuperación y cambio de contraseña.
- `/reservar`: selección del modelo y fechas, disponibilidad, conductor, documento y licencia, lugares de entrega, revisión y creación de orden.
- `/dashboard`: panel del cliente o administrador según el rol verificado en la base de datos.
- El cliente primero guarda la orden. Después abre WhatsApp con el número de orden, carro, fechas, lugares y total. Los números de documento y licencia **no** se añaden al mensaje.
- Un administrador registra los pagos ya verificados y sus referencias. Al completar el pago, puede aprobar y asignar una unidad disponible.
- Entrega y devolución registran notas de kilometraje, combustible y estado del vehículo. El historial es acumulativo.
- Administración incluye órdenes con búsqueda y filtros, exportación CSV, calendario, unidades por modelo, mantenimiento/inactivación, clientes, pagos, reembolsos y tarifas.

## Demostración

Abrir `/dashboard?demo=1&role=admin` o `/dashboard?demo=1&role=customer`. Se muestra permanentemente una etiqueta de demostración. Los datos ficticios se guardan en `sessionStorage` del navegador, separados de Supabase. Las acciones de demostración nunca envían WhatsApp ni escriben en la base real. No introducir información real. Configuración permite restablecer los ejemplos.

Si Supabase no está configurado, el ingreso muestra este recorrido de prueba; no finge guardar reservas reales. La base no se crea automáticamente ni se asignan administradores desde la interfaz. La primera entrega se publica como **preview** para revisar este nuevo flujo antes de sustituir el sistema actual en producción.

## Conectar Supabase

1. Crear un proyecto de Supabase propio. Ejecutar una vez `supabase/migrations/202609220001_rental_system.sql` en su editor SQL, o aplicar la migración con Supabase CLI. No ejecutarla sobre un esquema parcialmente creado; la migración es transaccional.
2. Configurar las dos variables de `supabase/environment.example` en Vercel para el entorno deseado y volver a desplegar. Para desarrollo se colocan en `.env.local`, que está ignorado por Git. No se requiere clave `service_role`, `sb_secret_` ni contraseña de base de datos en la app.
3. En Auth, habilitar Email/Password y confirmación de correo, establecer una contraseña mínima de 12 caracteres y configurar el servicio de correo de producción. Añadir la URL exacta de la app como Site URL y sus `/ingresar` y `/ingresar?recovery=1` a las redirecciones permitidas. Para localhost, añadir `http://127.0.0.1:3001/ingresar` y la variante de recuperación. No usar redirecciones comodín hacia sitios de terceros.
4. Crear y verificar la cuenta del propietario. Un operador con acceso al editor SQL promueve **esa cuenta concreta**, después de comprobar su dirección. Sustituir el marcador antes de ejecutar:

   ```sql
   update public.rental_profiles
   set role = 'admin'
   where id = (
     select id from auth.users
     where email = 'CORREO-DEL-PROPIETARIO'
       and email_confirmed_at is not null
   ) returning id, email, role;
   ```

   El registro siempre crea un cliente, incluso si manipula los metadatos del formulario.
5. Ingresar como administrador y registrar **las unidades reales** con matrícula, modelo y nombre interno en Flota. La migración solo añade los cinco modelos del catálogo; no inventa carros disponibles. Revisar las tarifas antes de abrir reservas.
6. Probar con dos cuentas distintas: cada cliente ve solo sus órdenes, pagos e historial. Crear solicitud, verificar pago, aprobar, entregar y devolver. Configurar copias de seguridad del proyecto y el acceso del equipo responsable.
7. Una vez revisado el sistema conectado, desplegar a producción con las mismas variables, registrar el dominio definitivo y las URL de correo correspondientes.

Documentación de referencia: [claves públicas de Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [autenticación por contraseña](https://supabase.com/docs/guides/auth/passwords), [seguridad por fila](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Reglas de la primera versión

- Moneda USD. Alquiler por días, de 1 a 90 días, usando la fecha de Caracas. No se cobra una tarjeta ni se conecta una API de pagos o WhatsApp; el operador verifica el pago externamente y lo registra.
- Las solicitudes pendientes no retienen inventario. La aprobación requiere el pago completo, verifica de nuevo la disponibilidad y asigna una unidad física del modelo pedido.
- Una restricción de exclusión de PostgreSQL impide fechas solapadas para una misma unidad, incluso si se omite la comprobación de la interfaz. Las operaciones bloquean la fila de la orden/unidad cuando corresponde. Los reintentos de creación, pagos y estados usan identificadores para evitar duplicados.
- Las fechas usan `[retiro, devolución)`: el día de devolución puede usarse en el siguiente alquiler. No existe planificación por horas ni tiempo de limpieza configurable en esta versión. Las entregas solo se registran dentro del período acordado. Un carro con devolución atrasada sigue indisponible hasta registrar su devolución.
- El cliente solo puede cancelar solicitudes pendientes; el administrador puede cancelar confirmadas. Las órdenes con pagos que se cancelan muestran el saldo por reembolsar; la cancelación no finge devolver dinero.
- Las unidades con órdenes confirmadas o activas no se pueden modificar hasta resolver esos alquileres. Las unidades en mantenimiento o inactivas no cuentan como disponibles.
- El cambio de fechas se hace cancelando y creando otra orden, preservando el historial. No incluye seguros/extras, depósitos de garantía, multas, facturación fiscal, firma digital, documentos adjuntos ni reconocimiento automático de pagos.
- El catálogo público mantiene sus precios informativos y la indicación de tarifa final sujeta a confirmación. El formulario conectado usa la tarifa vigente en la base, y cada orden conserva una copia de la tarifa al crearse. Si se cambian precios base de la marca, actualizar también `lib/fleet.ts` y los textos públicos correspondientes.
- La app de operaciones está en español. El sitio comercial conserva sus rutas ES/EN. Las rutas privadas tienen `noindex` y no figuran en el sitemap.

## Seguridad y validación

Todas las tablas tienen RLS; los clientes solo leen registros propios. Las matrículas y el listado completo de clientes solo están disponibles para administradores. Las escrituras se realizan mediante funciones autorizadas en Postgres, no mediante permisos genéricos de escritura. El cálculo de importes, el rol, las transiciones y la asignación de unidades se validan en la base. La disponibilidad pública devuelve únicamente conteos agregados por modelo. No se registran contraseñas ni claves privadas en el repositorio.

`npm test` ejecuta las pruebas existentes, validaciones de fechas/mensajes/configuración y la migración completa en PostgreSQL embebido (PGlite con btree_gist). Las pruebas de la base ejercitan RLS, roles, precios inmutables, reintentos, pagos, restricciones de solapamiento, cancelación y reembolsos. Esta validación no sustituye la prueba de correo/Auth contra el proyecto de Supabase real, que aún debe conectarse.

Las colecciones del panel se leen con paginación explícita para no truncar en el límite de PostgREST. Para operaciones de gran volumen, la siguiente mejora será paginar también la presentación y agregar informes en SQL.
