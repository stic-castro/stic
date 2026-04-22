export function toWhatsAppHref(phone: string, message?: string) {
  const normalized = phone.replace(/[^\d]/g, '');

  if (!normalized) {
    return null;
  }

  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalized}${query}`;
}

export function formatDateTimeInBolivia(value: string) {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/La_Paz',
  }).format(new Date(value));
}
