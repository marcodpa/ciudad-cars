import { PDFDocument, rgb, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { documentLabels, type BillingDocument } from './billing-domain';
import type { RentalOrder } from './rental-domain';

// Loaded only on export; no PDF/font payload is part of the public landing page.
export async function createBillingPdf(
  doc: BillingDocument,
  order: RentalOrder,
  parentNumber: string | null,
  demo: boolean,
  fontBytes: Uint8Array,
) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const supported = new Set(font.getCharacterSet());
  const navy = rgb(0.02, 0.15, 0.21),
    muted = rgb(0.35, 0.42, 0.45);
  let page: PDFPage;
  let y = 0;
  const title = `${documentLabels[doc.kind]} ${doc.number || 'BORRADOR'}`;
  const amount = (n: number) =>
    new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n / 100) + ' USD';
  const glyphWidths = new Map<string, number>();
  function width(value: string, size: number) {
    let result = 0;
    for (const c of value) {
      let w = glyphWidths.get(c);
      if (w === undefined) {
        w = font.widthOfTextAtSize(c, 1);
        glyphWidths.set(c, w);
      }
      result += w * size;
    }
    return result;
  }
  function clean(text: string) {
    const value = Array.from(text.normalize('NFC'))
      .filter((c) => c.charCodeAt(0) >= 32 || c === '\n' || c === '\t')
      .join('');
    for (const ch of value) {
      if (ch !== '\n' && ch !== '\t' && !supported.has(ch.codePointAt(0)!))
        throw new Error(
          'El PDF contiene un carácter no compatible con la tipografía. Revisa los datos antes de descargar.',
        );
    }
    return value;
  }
  function newPage() {
    page = pdf.addPage([595.28, 841.89]);
    page.drawRectangle({
      x: 0,
      y: 778,
      width: 595.28,
      height: 64,
      color: navy,
    });
    page.drawText('CIUDAD CARS', {
      x: 42,
      y: 802,
      font,
      size: 20,
      color: rgb(0.72, 0.95, 0.19),
    });
    page.drawText(
      demo
        ? 'DEMOSTRACIÓN · SIN VALIDEZ'
        : doc.status === 'issued'
          ? 'DOCUMENTO COMERCIAL'
          : doc.status === 'void'
            ? 'ANULADO'
            : 'BORRADOR · SIN EMITIR',
      { x: 42, y: 785, font, size: 8, color: rgb(1, 1, 1) },
    );
    y = 747;
  }
  function ensure(height: number) {
    if (y - height < 70) newPage();
  }
  function text(value: string, size = 10, color = navy) {
    for (const paragraph of clean(value).split('\n')) {
      let line = '';
      for (const word of paragraph.replaceAll('\t', ' ').split(' ')) {
        if (width(line + (line ? ' ' : '') + word, size) > 511 && line) {
          ensure(size + 6);
          page.drawText(line, { x: 42, y, font, size, color });
          y -= size + 6;
          line = '';
        }
        // Long identifiers/URLs are split at glyph boundaries instead of overflowing the page.
        for (const ch of (line ? ' ' : '') + word) {
          if (width(line + ch, size) > 511) {
            ensure(size + 6);
            page.drawText(line, { x: 42, y, font, size, color });
            y -= size + 6;
            line = '';
          }
          line += ch;
        }
      }
      ensure(size + 6);
      page.drawText(line, { x: 42, y, font, size, color });
      y -= size + 6;
    }
  }
  function gap(n = 10) {
    y -= n;
  }
  newPage();
  pdf.setTitle(title);
  pdf.setAuthor(doc.issuer.name);
  pdf.setSubject('Documento comercial de alquiler · Ciudad Cars');
  pdf.setLanguage('es-VE');
  text(title, 22);
  text(
    `Orden ${order.code} · Emisión: ${doc.issued_at?.slice(0, 10) || 'Pendiente'} · Vencimiento: ${doc.due_date}`,
    9,
    muted,
  );
  if (parentNumber) text(`Documento de origen: ${parentNumber}`, 10);
  gap();
  for (const [label, party] of [
    ['EMISOR', doc.issuer],
    ['CLIENTE', doc.customer],
  ] as const) {
    text(label, 9, muted);
    text(party.name || 'Emisor pendiente de configurar', 12);
    text(`${party.tax_id}\n${party.address}`, 10);
    if (party.email || party.phone)
      text([party.email, party.phone].filter(Boolean).join(' · '), 9, muted);
    gap();
  }
  text('DETALLE DE SERVICIOS', 11);
  gap(4);
  for (const [i, line] of doc.lines.entries()) {
    const gross = Number(
      (BigInt(Math.round(line.quantity * 1000)) * BigInt(line.unit_cents) +
        BigInt(500)) /
        BigInt(1000),
    );
    const base = gross - line.discount_cents,
      tax = Number(
        (BigInt(base) * BigInt(line.tax_bps) + BigInt(5000)) / BigInt(10000),
      );
    ensure(75);
    text(`${i + 1}. ${line.description}`, 11);
    text(
      `${line.quantity} × ${amount(line.unit_cents)} · Descuento: ${amount(line.discount_cents)}`,
      9,
      muted,
    );
    text(
      `${doc.tax_label} ${line.tax_bps / 100}%: ${amount(tax)} · Total: ${amount(base + tax)}`,
      9,
    );
    gap(7);
  }
  ensure(112);
  text(`Subtotal: ${amount(doc.subtotal_cents)}`);
  text(`Descuentos: ${amount(doc.discount_cents)}`);
  text(`${doc.tax_label}: ${amount(doc.tax_cents)}`);
  text(
    `TOTAL ${doc.kind === 'credit' ? 'A ACREDITAR ' : ''}${amount(doc.total_cents)}`,
    17,
  );
  gap();
  if (doc.fx_rate) {
    text(
      `Referencia VES: ${((doc.total_cents / 100) * doc.fx_rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`,
      10,
    );
    text(
      `Tasa registrada: ${doc.fx_rate} VES/USD. Referencia manual guardada al emitir.`,
      9,
      muted,
    );
    gap();
  }
  if (doc.reason) {
    text('Motivo: ' + doc.reason);
    gap();
  }
  if (doc.notes) {
    text('Observaciones: ' + doc.notes);
    gap();
  }
  if (doc.terms) {
    text('Condiciones: ' + doc.terms);
    gap();
  }
  text(
    'Documento comercial. No constituye un comprobante fiscal autorizado.',
    9,
    muted,
  );
  if (demo) text('DATOS DE EJEMPLO. SIN VALIDEZ.', 10);
  for (const [i, p] of pdf.getPages().entries()) {
    p.drawLine({
      start: { x: 42, y: 50 },
      end: { x: 553, y: 50 },
      thickness: 0.5,
      color: muted,
    });
    p.drawText(
      `${doc.number || 'BORRADOR'} · ${i + 1} / ${pdf.getPageCount()} · Ciudad Cars`,
      { x: 42, y: 34, size: 8, font, color: muted },
    );
  }
  return pdf.save();
}
