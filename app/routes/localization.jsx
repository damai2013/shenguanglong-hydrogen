import {redirect} from 'react-router';

const COUNTRY_CODES = new Set(['US', 'TW', 'JP', 'CN']);
const LANGUAGE_CODES = new Set(['ZH_TW', 'EN', 'JA']);

export async function action({request, context}) {
  const formData = await request.formData();
  const country = formData.get('country');
  const language = formData.get('language');

  if (typeof country === 'string' && COUNTRY_CODES.has(country)) {
    context.session.set('localizationCountry', country);
  }

  if (typeof language === 'string' && LANGUAGE_CODES.has(language)) {
    context.session.set('localizationLanguage', language);
  }

  return redirect(getSafeRedirect(formData.get('redirectTo'), request.url));
}

function getSafeRedirect(value, requestUrl) {
  if (typeof value !== 'string' || !value) return '/';

  try {
    const destination = new URL(value, requestUrl);
    const requestOrigin = new URL(requestUrl).origin;

    if (destination.origin !== requestOrigin) return '/';
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return '/';
  }
}
