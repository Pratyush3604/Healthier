import { useState, useEffect, useCallback } from 'react';

const EVENT_NAME = 'healtify-storage-change';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const read = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(read);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next =
          typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
          // Notify same-tab listeners (storage event only fires cross-tab)
          window.dispatchEvent(
            new CustomEvent(EVENT_NAME, { detail: { key, value: next } })
          );
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key]
  );

  // Listen for changes from other components/tabs and re-read.
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ key: string }>;
      if (ce.detail && ce.detail.key && ce.detail.key !== key) return;
      setStoredValue(read());
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === key) setStoredValue(read());
    };
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', storageHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}
