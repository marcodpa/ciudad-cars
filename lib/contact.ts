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
): { error: string } | { message: string } {
  const name = request.name.trim();
  const email = request.email.trim();
  const message = request.message.trim();
  if (name.length < 2 || name.length > 100)
    return { error: 'Escribe tu nombre (entre 2 y 100 caracteres).' };
  if (
    email &&
    (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    return { error: 'Revisa tu correo electrónico o deja ese campo vacío.' };
  if (!contactTopics.some((topic) => topic === request.topic))
    return { error: 'Elige el motivo de tu consulta.' };
  if (message.length < 10 || message.length > 2000)
    return {
      error:
        'Cuéntanos un poco más: tu mensaje debe tener entre 10 y 2.000 caracteres.',
    };
  return {
    message: [
      'Hola, Ciudad Cars. Soy ' + name + '.',
      'Consulta: ' + request.topic + '.',
      email ? 'Mi correo: ' + email : '',
      '',
      message,
    ]
      .filter((line) => line !== '')
      .join('\n'),
  };
}
