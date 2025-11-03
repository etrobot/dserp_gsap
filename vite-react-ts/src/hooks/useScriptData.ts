import { useState, useEffect } from 'react';
import type { ScriptSpec } from '@/types/scriptTypes';

export const useScriptData = (scriptPath: string) => {
  const [data, setData] = useState<ScriptSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!scriptPath) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(scriptPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch script: ${response.statusText}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scriptPath]);

  return { data, loading, error };
};
