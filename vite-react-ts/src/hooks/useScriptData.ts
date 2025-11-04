import { useState, useEffect } from 'react';
import type { ScriptSpec } from '@/types/scriptTypes';
import { validateScript } from '@/utils/scriptValidator';
import { useToast } from '@/contexts/ToastContext';

export interface ScriptDataResult {
  data: ScriptSpec | null;
  loading: boolean;
  error: Error | null;
  validationErrors: string[];
  isValid: boolean;
}

export const useScriptData = (scriptPath: string): ScriptDataResult => {
  const { showToast } = useToast();
  const [data, setData] = useState<ScriptSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (!scriptPath) {
      setLoading(false);
      setData(null);
      setError(null);
      setValidationErrors([]);
      setIsValid(true);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setValidationErrors([]);
        setIsValid(true);

        const response = await fetch(scriptPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch script: ${response.statusText}`);
        }
        const json = await response.json();

        // Validate script structure
        const validationResult = validateScript(json);

        if (!validationResult.isValid) {
          setValidationErrors(validationResult.errors);
          setIsValid(false);
          setData(null);
          
          // Show each error as a toast notification
          validationResult.errors.forEach((error) => {
            showToast(error, 'error', 5000);
          });
          
          throw new Error(
            `Script validation failed:\n${validationResult.errors.map((e) => `• ${e}`).join('\n')}`
          );
        }

        // Validation passed
        setValidationErrors([]);
        setIsValid(true);
        setData(json);
        showToast(`Script loaded successfully: ${validationResult.stats.totalSections} sections`, 'success', 3000);

        // Log stats in development
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `✅ Script loaded and validated: ${validationResult.stats.totalSections} sections, ${validationResult.stats.contentCount} items`,
            validationResult.stats
          );
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        setData(null);
        console.error('Script loading/validation error:', errorObj);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scriptPath]);

  return { data, loading, error, validationErrors, isValid };
};
