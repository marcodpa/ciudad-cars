import { translate, type Language } from './language.js';

export const contactTopics = [
  'Alquiler de un vehículo',
  'Una reserva existente',
  'Servicios y complementos',
  'Cita de taller',
  'Otra consulta',
] as const;
export type ContactRequest = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

export function prepareContact(
  request: ContactRequest,
  language: Language = 'es',
): { error: string } | { message: string } {
  const t = (text: string) => translate(text, language);
  const name = request.name.trim();
  const email = request.email.trim();
  const message = request.message.trim();
  if (name.length < 2 || name.length > 100)
    return { error: t('Escribe tu nombre (entre 2 y 100 caracteres).') };
  if (
    email &&
    (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    return { error: t('Revisa tu correo electrónico o deja ese campo vacío.') };
  if (!contactTopics.some((topic) => topic === request.topic))
    return { error: t('Elige el motivo de tu consulta.') };
  if (message.length < 10 || message.length > 2000)
    return {
      error: t(
        'Cuéntanos un poco más: tu mensaje debe tener entre 10 y 2.000 caracteres.',
      ),
    };
  return {
    message: [
      (language === 'en'
        ? 'Hello, Ciudad Cars. I’m '
        : 'Hola, Ciudad Cars. Soy ') +
        name +
        '.',
      (language === 'en' ? 'Enquiry: ' : 'Consulta: ') + t(request.topic) + '.',
      email ? (language === 'en' ? 'My email: ' : 'Mi correo: ') + email : '',
      '',
      message,
    ]
      .filter((line) => line !== '')
      .join('\n'),
  };
}
