import { useCallback, useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
  }, [key, value]);

  return [value, setValue] as const;
}

export function useCompareList() {
  const [ids, setIds] = useLocalStorage<string[]>("dunest.compare", []);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setIds],
  );

  const remove = useCallback(
    (id: string) => {
      setIds((prev) => prev.filter((x) => x !== id));
    },
    [setIds],
  );

  const clear = useCallback(() => setIds([]), [setIds]);

  return { ids, toggle, remove, clear, has: (id: string) => ids.includes(id) };
}

export type InterestEntry = {
  listingId: string;
  name: string;
  collegeYear: string;
  course: string;
  moveIn: string;
  budget: number;
  genderPref: string;
  whatsapp: string;
};

export function useInterests() {
  const [entries, setEntries] = useLocalStorage<InterestEntry[]>("dunest.interests", []);
  const add = useCallback((e: InterestEntry) => setEntries((prev) => [...prev, e]), [setEntries]);
  const countFor = (id: string) => entries.filter((e) => e.listingId === id).length;
  return { entries, add, countFor };
}

export type AdminListing = Record<string, unknown> & { _id: string; _submittedAt: string };

export function useAdminListings() {
  const [items, setItems] = useLocalStorage<AdminListing[]>("dunest.admin", []);
  const add = useCallback(
    (data: Record<string, unknown>) => {
      const entry: AdminListing = {
        ...data,
        _id: crypto.randomUUID(),
        _submittedAt: new Date().toISOString(),
      };
      setItems((prev) => [entry, ...prev]);
      return entry;
    },
    [setItems],
  );
  return { items, add };
}

