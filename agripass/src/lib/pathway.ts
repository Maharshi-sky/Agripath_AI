import { BLOCS } from '../data/blocs';
import { COUNTRIES, byName } from '../data/countries';
import type { BlocInstrument, Category, CountryProfile, Bloc } from '../data/types';

export interface PathwayGroup { bloc: Bloc; instrument: BlocInstrument; domain: Category | 'plantHealth'; siblings: CountryProfile[] }

const membersOf = (bloc: Bloc, inst: BlocInstrument) =>
  COUNTRIES.filter((c) => (inst.members ?? bloc.members).includes(c.id));

/** Bloc instruments that bind the destination to other countries for this category (plus plant health for living goods). */
export function pathwayFor(country: CountryProfile, category: Category): PathwayGroup[] {
  const out: PathwayGroup[] = [];
  const domains: (Category | 'plantHealth')[] = [category];
  if (category === 'seeds' || category === 'biologicals') domains.push('plantHealth');
  if (category === 'machinery') domains.push('plantHealth');
  for (const id of country.blocs) {
    const bloc = BLOCS[id];
    for (const d of domains) {
      const inst = bloc.harmonization[d];
      if (!inst) continue;
      const mem = membersOf(bloc, inst);
      if (!mem.some((m) => m.id === country.id)) continue;
      if (d === 'plantHealth' && category === 'machinery') continue; // only relevant for used machinery; keep list focused
      out.push({ bloc, instrument: inst, domain: d, siblings: mem.filter((m) => m.id !== country.id) });
    }
  }
  const rank = { single: 0, catalogue: 1, data: 2, standards: 3 } as const;
  return out.sort((a, b) => (a.domain === 'plantHealth' ? 1 : 0) - (b.domain === 'plantHealth' ? 1 : 0) || rank[a.instrument.level] - rank[b.instrument.level]);
}

/** Countries that share the USDA FAIRS reporting office with this one (not a legal harmonization). */
export function fairsGroup(country: CountryProfile): { hub?: CountryProfile; hubName?: string; members: CountryProfile[] } {
  const hubName = country.fairs?.status === 'hub' ? country.fairs.hub : country.fairs?.status === 'own' ? country.name : undefined;
  if (!hubName) return { members: [] };
  const members = COUNTRIES.filter((c) => c.id !== country.id && ((c.fairs?.status === 'hub' && c.fairs.hub === hubName) || c.name === hubName));
  return { hub: byName(hubName), hubName, members };
}

export const blocLabel = (c: CountryProfile) => c.blocs.join(' · ');
