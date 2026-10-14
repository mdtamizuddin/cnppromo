import { useState, useEffect } from 'react';

/**
 * useDebounce hook
 * Delays updating the debounced value until after the specified delay
 * has passed since the last time the input value changed.
 *
 * @param {any} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {any} debouncedValue
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
