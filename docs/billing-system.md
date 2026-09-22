# Facturación comercial de Ciudad Cars

## Operación

Acceso en **Dashboard → Facturación** y desde el detalle de cada orden. El administrador selecciona una orden, revisa los datos del cliente y su dirección de facturación, añade conceptos y guarda un borrador. La revisión muestra los importes antes de confirmar la emisión. El borrador no ocupa una numeración ni modifica saldos.

Al emitir se asigna una serie correlativa independiente por tipo: `CC-F-000001`, `CC-NC-000001` y `CC-ND-000001`. Una orden admite una factura base vigente. Los documentos emitidos no se borran ni editan; los ajustes se hacen mediante notas de crédito o débito vinculadas a la factura. Solo los borradores pueden anularse, con motivo. El equipo descarga los documentos y los comparte por WhatsApp; no existe un panel de clientes. El domicilio de la reserva se propone como dirección de facturación y puede revisarse antes de emitir.

Los conceptos admiten cantidad (hasta tres decimales), precio USD, descuento monetario por línea e impuesto porcentual por línea. Los importes se calculan en centavos, con redondeo positivo de mitades hacia arriba, aplicando el impuesto después del descuento. La base recalcula los valores; no confía en el total del navegador. Límite: 50 conceptos por documento y 10 millones USD por documento/orden facturada.

## Pagos y disponibilidad

La facturación usa el mismo registro de pagos y reembolsos de las órdenes. No genera otro pago al emitir ni cobra automáticamente. El total cotizado original permanece en `rental_orders.total`; `billing_total` contiene el total de documentos emitidos: facturas + débitos − créditos. El dashboard y los límites de pago usan este último cuando existe.

El equipo registra únicamente pagos o reembolsos ya verificados externamente, con método y referencia. Una nota de crédito puede crear un saldo a favor; permite registrar el reembolso hasta ese importe. Cancelar una orden permite devolver el pago neto y libera la disponibilidad según las reglas del alquiler, pero no anula su factura: hay que emitir la nota correspondiente. Las notas de crédito no pueden superar el total, la base ni el impuesto restante de la orden.

La aprobación requiere pago completo y una unidad disponible. Las notas y facturas por sí mismas no asignan carros ni cambian fechas. Las órdenes completadas pueden recibir pagos de cargos posteriores. En órdenes canceladas/rechazadas solo se pueden emitir créditos.

## Documentos y reportes

- Filtros por estado, fechas y búsqueda por cliente, número u orden.
- Resumen de facturado neto, cuentas por cobrar y saldos a favor de las órdenes con factura emitida. El resumen es global; los filtros acotan la lista y el CSV.
- CSV de los documentos filtrados; los créditos tienen signo negativo. Los borradores/anulados se distinguen por estado y no entran en el resumen facturado.
- PDF real descargable con cliente, emisor, conceptos, descuentos, impuestos, número, vencimiento, notas, condiciones y referencia de documento origen. Soporta múltiples páginas. Puede abrirse e imprimirse con el lector PDF del dispositivo.
- El PDF conserva el documento emitido; el saldo actual, que cambia con pagos/notas, se consulta en el dashboard. La fuente Lato se distribuye bajo SIL OFL, con licencia en `public/fonts/Lato-LICENSE.txt`. El generador y su tipografía se cargan solo al exportar.

## Puesta en funcionamiento

1. Conectar Supabase siguiendo `docs/rental-system.md`. Aplicar en orden las migraciones `202609220001_rental_system.sql`, `202609220002_billing.sql` y `202609220003_guest_reservations.sql`. En instalaciones existentes, ejecutar solo las pendientes. La tercera limita todos los documentos al equipo.
2. Entrar con el administrador autorizado y abrir **Datos de facturación**. Completar razón social, RIF/identificación, dirección, contactos, serie, impuesto y condiciones. Los valores iniciales reales están vacíos y el impuesto comienza en cero; no se presuponen datos legales ni una tasa.
3. La serie se bloquea después de la primera emisión. Los cambios de datos afectan a nuevos borradores/guardados, nunca a documentos emitidos. Si se completa el emisor después de crear un borrador, editar y guardar ese borrador antes de emitir.
4. La moneda operativa es USD. Puede registrarse manualmente una tasa VES/USD para mostrar una equivalencia en el documento; no consulta BCV ni actualiza documentos anteriores. Las notas heredan la tasa como valor inicial.
5. Verificar con el responsable fiscal la configuración y conectar un proveedor autorizado antes de usar estos documentos como comprobantes fiscales. Esta implementación es **facturación comercial**, no integración SENIAT, libro fiscal certificado, retenciones, declaración tributaria ni contabilidad de doble partida. No afirma autorización fiscal por tener numeración o PDF.

Hasta conectar Supabase, `/dashboard?view=billing&demo=1&role=admin` permite probar todo con datos ficticios en la sesión del navegador. Esos datos no se sincronizan entre dispositivos ni crean operaciones reales. Nunca introducir datos reales en la demostración.

## Integridad y pruebas

RLS restringe configuración, borradores y documentos emitidos al administrador. Las funciones verifican roles; las tablas no admiten escrituras directas desde los clientes. El bloqueo por orden serializa pagos y ajustes; la fila de configuración serializa numeración. Versiones de borrador evitan sobrescrituras, claves de operación evitan duplicados al reintentar y un trigger protege documentos emitidos/anulados. No se expone la clave de servicio de Supabase.

`npm test` comprueba redondeo, fechas y límites, conciliación de notas/pagos, PDF multipágina y ambas migraciones con PostgreSQL embebido: roles, visibilidad, recálculo, numeración, reintentos, inmutabilidad, límites de crédito y reembolsos. Faltan las credenciales del proyecto real para validar Auth/correo y persistencia real de extremo a extremo.
