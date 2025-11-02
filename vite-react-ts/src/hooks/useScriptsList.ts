import { useState, useEffect } from 'react';
import type { ScriptsIndex } from '@/types/script';

const SCRIPTS_INDEX_PATH = '/scripts/index.json';

export const useScriptsList = () => {
  const [scripts, setScripts] = useState<ScriptsIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const response = await fetch(SCRIPTS_INDEX_PATH);
        if (!response.ok) {
          throw new Error(`Failed to fetch scripts list: ${response.statusText}`);
        }
        const json = await response.json();
        setScripts(json);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  return { scripts, loading, error };
};
