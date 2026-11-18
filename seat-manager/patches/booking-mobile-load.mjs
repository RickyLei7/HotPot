export const publicBookingStylesheet = '/client/booking-base-20261118.css';

const bookingModules = [
  '/client/booking-client.js',
  '/client/booking-embed.js',
  '/client/booking-measurement.js',
  '/domain/booking-attribution.js',
  '/domain/restaurant-time.js',
];

export function preparePublicBookingPage(response) {
  if (!response.ok || !response.headers.get('Content-Type')?.startsWith('text/html')) {
    return response;
  }

  const preload = bookingModules.map(path => `<link rel="modulepreload" href="${path}">`).join('\n');
  return new HTMLRewriter()
    .on('head', { element(head) { head.append(preload, { html: true }); } })
    .on('link[rel="stylesheet"][href="/client/styles.css"]', {
      element(link) { link.setAttribute('href', publicBookingStylesheet); },
    })
    .on('#booking-phone', { element(phone) { phone.setAttribute('enterkeyhint', 'done'); } })
    .transform(response);
}
