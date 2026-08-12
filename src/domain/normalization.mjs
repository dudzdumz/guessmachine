import { createHash } from 'node:crypto';

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const PUNCTUATION = /[\p{P}\p{S}]+/gu;

export function normalizeArabic(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/ـ/g, '')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeEnglish(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeForSearch(value, language) {
  return language === 'ar' ? normalizeArabic(value) : normalizeEnglish(value);
}

export function createFactFingerprint({ subject, predicate, object, qualifiers = '' }) {
  const canonical = [subject, predicate, object, qualifiers]
    .map((part) => normalizeEnglish(part))
    .join('|');
  return createHash('sha256').update(canonical).digest('hex');
}
