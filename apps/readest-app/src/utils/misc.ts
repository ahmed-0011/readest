import { md5 } from 'js-md5';

export const uniqueId = () => Math.random().toString(36).substring(2, 9);

export const randomMd5 = () => md5(Math.random().toString());

export const getContentMd5 = (content: unknown) => md5(JSON.stringify(content));

export const makeSafeFilename = (filename: string, replacement = '_') => {
  // Windows restricted characters + control characters and reserved names
  const unsafeCharacters = /[<>:"\/\\|?*\x00-\x1F]/g;
  const reservedFilenames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  const maxFilenameLength = 255;

  let safeName = filename.replace(unsafeCharacters, replacement);

  if (reservedFilenames.test(safeName)) {
    safeName = `${safeName}${replacement}`;
  }

  if (safeName.length > maxFilenameLength) {
    safeName = safeName.substring(0, maxFilenameLength);
  }

  return safeName.trim();
};

export const getUserLang = () => navigator?.language.split('-')[0] || 'en';

export const getUserLocale = (lang: string): string | undefined => {
  const languages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  const filteredLocales = languages.filter((locale) => locale.startsWith(lang));
  return filteredLocales.length > 0 ? filteredLocales[0] : undefined;
};

export const getOSPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('macintosh') || userAgent.includes('mac os x')) return 'macos';
  if (userAgent.includes('windows nt')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (userAgent.includes('android')) return 'android';

  return '';
};

export const isValidURL = (url: string, allowedSchemes: string[] = ['http', 'https']) => {
  try {
    const { protocol } = new URL(url);
    return allowedSchemes.some((scheme) => `${scheme}:` === protocol);
  } catch {
    return false;
  }
};

export const stubTranslation = (key: string) => {
  return key;
};
