import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const next = typeof value === "function" ? (value as (prev: T) => T)(storedValue) : value;
      setStoredValue(next);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore write errors
    }
  };

  return [storedValue, setValue] as const;
}
