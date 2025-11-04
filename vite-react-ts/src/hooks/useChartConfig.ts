import { useState, useEffect } from 'react';

interface UseChartConfigResult {
  config: any;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for loading external chart configuration files
 * @param chartPath - Path to the chart config file (e.g., '/data/ysjfTagInsightScript/frequencyLikesChart.json')
 * @param inlineConfig - Fallback inline configuration if chartPath is not provided
 */
export const useChartConfig = (chartPath: string | undefined, inlineConfig: any): UseChartConfigResult => {
  const [config, setConfig] = useState<any>(inlineConfig);
  const [loading, setLoading] = useState(!!chartPath);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chartPath) {
      setConfig(inlineConfig);
      setLoading(false);
      setError(null);
      return;
    }

    const loadChartConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(chartPath);
        if (!response.ok) {
          throw new Error(`Failed to load chart config: ${response.statusText}`);
        }
        const json = await response.json();
        setConfig(json);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObj);
        setConfig(inlineConfig); // Fallback to inline config
        console.error('Chart config loading error:', errorObj);
      } finally {
        setLoading(false);
      }
    };

    loadChartConfig();
  }, [chartPath, inlineConfig]);

  return { config, loading, error };
};
