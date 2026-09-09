'use client';

import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { contactTopics, prepareContact } from '@/lib/contact';
import { whatsappUrl } from '@/lib/company';

export function ContactForm() {
  const [prepared, setPrepared] = useState('');
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  return (
    <div className="contact-form-card">
      <p className="eyebrow">CUÉNTANOS TU PLAN</p>
      <h2>¿Cómo podemos ayudarte?</h2>
      <p>Déjanos los detalles y continúa la conversación por WhatsApp.</p>
      <form
        onChange={() => {
          setPrepared('');
          setError('');
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const fieldValue = (key: string) => {
            const value = form.get(key);
            return typeof value === 'string' ? value : '';
          };
          const result = prepareContact({
            name: fieldValue('name'),
            email: fieldValue('email'),
            topic: fieldValue('topic'),
            message: fieldValue('message'),
          });
          if ('error' in result) {
            setError(result.error);
            setPrepared('');
            return;
          }
          setError('');
          setPrepared(result.message);
          requestAnimationFrame(() =>
            previewRef.current?.focus({ preventScroll: true }),
          );
        }}
      >
        <div className="form-two-columns">
          <label className="field" htmlFor="contact-name">
            <span>
              Tu nombre <span aria-hidden="true">*</span>
            </span>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              placeholder="Nombre y apellido"
              required
              minLength={2}
              maxLength={100}
            />
          </label>
          <label className="field" htmlFor="contact-email">
            <span>
              Correo <small>(opcional)</small>
            </span>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              maxLength={254}
            />
          </label>
        </div>
        <label className="field" htmlFor="contact-topic">
          <span>
            ¿Sobre qué quieres conversar? <span aria-hidden="true">*</span>
          </span>
          <NativeSelect
            id="contact-topic"
            name="topic"
            defaultValue={contactTopics[0]}
            required
          >
            {contactTopics.map((topic) => (
              <NativeSelectOption key={topic} value={topic}>
                {topic}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
        <label className="field" htmlFor="contact-message">
          <span>
            Tu mensaje <span aria-hidden="true">*</span>
          </span>
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            minLength={10}
            maxLength={2000}
            placeholder="Cuéntanos tus fechas, cuántas personas viajan o qué necesitas…"
            aria-describedby="contact-message-hint"
          />
        </label>
        <p className="form-hint" id="contact-message-hint">
          Los campos con * son obligatorios. No incluyas documentos ni datos de
          pago.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="cta">
          Preparar mi consulta
          <ArrowRight size={18} />
        </Button>
        <p className="form-hint">
          Podrás revisar el mensaje antes de abrir WhatsApp.
        </p>
      </form>
      {prepared && (
        <div
          className="contact-preview"
          ref={previewRef}
          tabIndex={-1}
          aria-labelledby="prepared-title"
        >
          <h3 id="prepared-title">
            <MessageCircle size={21} />
            Tu consulta está lista
          </h3>
          <p className="prepared-message">{prepared}</p>
          <a
            className="cta"
            href={whatsappUrl(prepared)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Continuar por WhatsApp
            <ArrowUpRight size={18} />
          </a>
          <p className="form-hint">
            El mensaje se enviará cuando tú lo confirmes en WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}
