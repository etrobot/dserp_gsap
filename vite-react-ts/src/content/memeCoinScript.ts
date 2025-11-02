import type { ScriptSpec } from './xlinDataInsghtScript';

// Path to the JSON file in public directory
export const MEME_COIN_SCRIPT_PATH = '/scripts/memeCoinScript.json';

// Function to fetch the script data from JSON
export const fetchMemeCoinScript = async (): Promise<ScriptSpec> => {
  const response = await fetch(MEME_COIN_SCRIPT_PATH);
  if (!response.ok) {
    throw new Error(`Failed to fetch meme coin script: ${response.statusText}`);
  }
  return response.json();
};
