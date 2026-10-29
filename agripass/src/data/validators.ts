import type { Issue } from './types';

type Check = (v: string, all: Record<string, string>) => Issue | null;

const err = (msg: string): Issue => ({ level: 'error', msg });
const warn = (msg: string): Issue => ({ level: 'warn', msg });
const num = (v: string) => (v === '' || v == null ? NaN : Number(String(v).replace(/,/g, '')));

export const V = {
  iec: ((v) => (v && !/^[A-Z0-9]{10}$/.test(v.toUpperCase()) ? err('IEC must be 10 characters (PAN-based), e.g. AABCD1234E.') : null)) as Check,
  gstin: ((v) => (v && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(v.toUpperCase()) ? err('GSTIN must be 15 characters, e.g. 27AABCD1234E1Z5.') : null)) as Check,
  email: ((v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? err('Enter a valid email address, e.g. exports@company.in.') : null)) as Check,
  phone: ((v) => (v && !/^\+?[\d\s\-()]{8,18}$/.test(v) ? err('Use international format, e.g. +91 22 4000 1234.') : null)) as Check,
  hs: ((v) => (v && !/^\d{4}(\.?\d{2})(\.?\d{2,4})?$/.test(v) ? err('HS code needs at least 6 digits, e.g. 1005.10.') : null)) as Check,
  un: ((v) => (v && !/^UN\s?\d{4}$/i.test(v) ? err('UN number format is UN followed by 4 digits, e.g. UN3082.') : null)) as Check,
  positive: ((v) => (v !== '' && !(num(v) > 0) ? err('Enter a number greater than zero.') : null)) as Check,
  pct: ((v) => (v !== '' && (isNaN(num(v)) || num(v) < 0 || num(v) > 100) ? err('Enter a percentage between 0 and 100.') : null)) as Check,
  notFuture: ((v) => (v && new Date(v) > new Date(Date.now() + 864e5) ? err('This date cannot be in the future.') : null)) as Check,
  notPast: ((v) => (v && new Date(v) < new Date(new Date().toDateString()) ? warn('This date is in the past — check the validity period.') : null)) as Check,
  min: (n: number, label: string): Check => (v) => (v !== '' && num(v) < n ? warn(`${label}: ${v} is below the typical minimum of ${n}.`) : null),
  max: (n: number, label: string, hard = false): Check => (v) => (v !== '' && num(v) > n ? (hard ? err : warn)(`${label}: ${v} exceeds the limit of ${n}.`) : null),
  after: (otherKey: string, label: string): Check => (v, all) => (v && all[otherKey] && new Date(v) <= new Date(all[otherKey]) ? err(`Must be after ${label}.`) : null),
  netLeGross: ((v, all) => (v && all.grossWeight && num(v) > num(all.grossWeight) ? err('Net weight cannot exceed gross weight.') : null)) as Check,
  minLen: (n: number): Check => (v) => (v && v.trim().length < n ? err(`Too short — add at least ${n} characters.`) : null),
};

export const all = (...checks: Check[]): Check => (v, a) => {
  for (const c of checks) {
    const r = c(v, a);
    if (r) return r;
  }
  return null;
};
