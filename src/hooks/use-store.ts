import { useEffect, useState } from "react";

/**
 * Custom hook to safely access Zustand stores with persistence in Next.js (SSR safe).
 * Prevents hydration mismatch by ensuring the store value is only returned after client-side hydration.
 *
 * @param store - The Zustand store hook
 * @param callback - Selector function to get the desired part of the state
 */
export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
