# Base de datos de Ciudad Cars

La base es PostgreSQL en Supabase. Las cuatro migraciones en `supabase/migrations` forman una secuencia reproducible: alquileres, facturación, reservas públicas y auditoría. No hay datos reales ni credenciales en el repositorio. El inventario físico se registra desde el panel; los cinco modelos iniciales son catálogo, no cinco carros disponibles.

## Mapa de datos

| Tabla | Función | Fechas conservadas |
| --- | --- | --- |
| `rental_profiles` | Administradores y contactos comerciales, sin cuenta de cliente público | `created_at`, `updated_at` |
| `rental_models` | Modelos, capacidades y tarifa vigente | `created_at`, `updated_at` |
| `rental_units` | Unidades físicas y estado operativo | `created_at`, `updated_at` |
| `rental_orders` | Solicitudes, fechas, cliente, precio fijado y estado | `created_at`, `updated_at` |
| `rental_payments` | Pagos y reembolsos verificados | `created_at` |
| `rental_events` | Hitos y notas de una orden | `created_at` |
| `rental_billing_settings` | Datos y numeración del emisor | `created_at`, `updated_at` |
| `rental_billing_documents` | Borradores, facturas y notas | `created_at`, `updated_at`, `issued_at` |
| `rental_audit_log` | Cambios automáticos en las ocho tablas anteriores | `occurred_at` |
| `private.guest_contacts`, `private.guest_submissions`, `private.billing_requests` | Identidad seudónima, límites de envío y reintentos seguros | `created_at` |

Todos los instantes se guardan con zona horaria (`timestamptz`). PostgreSQL conserva el instante absoluto; para informes de operación se muestra en `America/Caracas`. Las fechas de retiro y devolución son días locales (`date`), con período `[retiro, devolución)`. Los `updated_at` se cambian en la base mediante triggers, no dependen del reloj del navegador. En registros anteriores a la migración de auditoría, si faltaba una fecha de creación, el valor inicial es la fecha de instalación: **no representa una fecha histórica comprobada**.

## Historial de cambios

`rental_audit_log` guarda una fila por inserción, edición o eliminación de las tablas operativas. Incluye tabla, identificador, orden asociada, operación, fecha/hora exacta, actor cuando hay sesión, origen, campos modificados y estados anterior/posterior de los **campos autorizados**. El ID de transacción permite agrupar, por ejemplo, la emisión de una factura, el avance de su numeración y el cambio del saldo de la orden. Los reintentos sin cambios efectivos no crean filas nuevas.

Los estados del historial nunca copian nombre, teléfono, correo, cédula, licencia, domicilio, referencias de pago, notas ni datos privados de facturación. `changed_fields` sí indica que cambió un campo protegido, sin guardar su contenido otra vez. El registro empieza al aplicar la cuarta migración: no se inventan cambios anteriores. Solo administradores autenticados pueden leerlo por la API; los clientes y visitantes no pueden verlo ni escribirlo. Un trigger impide editar o borrar filas del historial, incluso mediante una consulta accidental del propietario de las tablas. Los administradores de infraestructura con control total de PostgreSQL siempre podrán modificar el esquema: para trazabilidad independiente y recuperación hacen falta copias de seguridad externas y control de acceso a la cuenta de Supabase.

Este historial cubre cambios de filas de negocio, no consultas de lectura ni cambios de estructura SQL. Para auditar DDL y accesos a nivel de servidor, Supabase ofrece [pgAudit](https://supabase.com/docs/guides/database/extensions/pgaudit); se configura por separado y sus logs tienen una retención distinta.

Ejemplo de consulta en el editor SQL de Supabase:

```sql
select id, occurred_at at time zone 'America/Caracas' as hora_caracas,
       entity_table, record_id, operation, actor_source, changed_fields,
       before_state, after_state
from public.rental_audit_log
where order_id = 'ID-DE-LA-ORDEN'::uuid
order by occurred_at desc, id desc
limit 100;
```

## Instalación en un proyecto nuevo

1. Crear un proyecto Supabase propiedad de Ciudad Cars. Guardar la contraseña de la base en el gestor de contraseñas, no en Git ni en el chat. Elegir región y plan según las necesidades reales del negocio.
2. Instalar la CLI oficial, iniciar sesión y vincular el proyecto. Revisar con `supabase db push --dry-run` y aplicar con `supabase db push`. **No usar `supabase db reset --linked`**: elimina el esquema remoto y sus datos. En una base existente, comprobar `supabase migration list` y aplicar solo las pendientes; no volver a ejecutar las primeras tres a mano.
3. Desactivar registros públicos en Supabase Auth. Crear y confirmar la cuenta del propietario desde Supabase. Promover únicamente ese usuario a `admin` con la consulta documentada en `docs/rental-system.md`.
4. Configurar en Vercel las variables de `supabase/environment.example` y las claves de Turnstile. La clave secreta de Supabase y la de Turnstile deben estar solo en el servidor. Registrar dominios y redirecciones de Auth. Publicar primero una vista de prueba.
5. Cargar las unidades físicas, comprobar tarifas, completar datos de facturación y ejecutar una reserva de prueba con datos ficticios. Verificar pago, aprobación, entrega, devolución, factura y que cada paso figure en `rental_audit_log` con su hora y actor.
6. Revisar copias de seguridad antes de operar. Supabase ofrece respaldos diarios en planes de pago y recomienda exportaciones periódicas fuera de la plataforma para el plan gratuito. La auditoría no reemplaza un respaldo ni restaura datos borrados.

La app no acepta reservas reales sin Supabase **y** Turnstile configurados. Hasta entonces muestra una demostración aislada en el navegador y no almacena órdenes reales.
