import { type DirectoryEntry, FOUNDRIES, PEOPLE } from '@/testing/mocks/directory';

export type { DirectoryEntry };

/** بحث بالاسم أو المعرّف (يقبل «@» في البداية) — أقصى 6 نتائج */
function search(list: DirectoryEntry[], q: string, exclude: readonly string[]) {
  const t = q.trim().replace(/^@/, '').toLowerCase();
  return list
    .filter((e) => !exclude.includes(e.id))
    .filter((e) => !t || e.name.toLowerCase().includes(t) || e.handle.includes(t))
    .slice(0, 6);
}

export const searchPeople = (q: string, exclude: readonly string[] = []) => search(PEOPLE, q, exclude);
export const searchFoundries = (q: string, exclude: readonly string[] = []) => search(FOUNDRIES, q, exclude);
export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
export const foundryById = (id: string) => FOUNDRIES.find((f) => f.id === id);
export const isKnownPerson = (id: string) => PEOPLE.some((p) => p.id === id);
export const isKnownFoundry = (id: string) => FOUNDRIES.some((f) => f.id === id);
