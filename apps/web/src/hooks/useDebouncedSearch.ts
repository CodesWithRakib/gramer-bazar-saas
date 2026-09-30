'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounced search input state for server-driven list views.
 *
 * The visible input updates immediately while the value handed to the API
 * settles after `delay`, so typing never fires a request per keystroke.
 * Debouncing happens in the change handler (not an effect) to avoid
 * set-state-in-effect churn on every keystroke.
 */
export function useDebouncedSearch(delay = 350) {
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const onInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setTerm(value.trim()), delay);
    },
    [delay]
  );

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setInput('');
    setTerm('');
  }, []);

  return { input, term, onInputChange, reset };
}
