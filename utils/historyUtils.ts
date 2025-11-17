import { HistoryItem } from '../types';

const HISTORY_KEY = 'qrThemerGenerationHistory';
const MAX_HISTORY_ITEMS = 20;

/**
 * Retrieves the generation history from local storage.
 * @returns {HistoryItem[]} An array of history items, or an empty array if none exists.
 */
export function getHistory(): HistoryItem[] {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    if (historyJson) {
      const history = JSON.parse(historyJson) as HistoryItem[];
      // Sort by timestamp descending to show newest first
      return history.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error("Failed to parse history from local storage:", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(HISTORY_KEY);
  }
  return [];
}

/**
 * Saves a new generation to the history in local storage.
 * @param {HistoryItem} newItem - The new history item to save.
 */
export function saveGenerationToHistory(newItem: HistoryItem): void {
  try {
    const currentHistory = getHistory();
    // Add the new item to the beginning of the array
    const updatedHistory = [newItem, ...currentHistory];

    // Limit the number of items stored to prevent excessive storage usage
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
      updatedHistory.length = MAX_HISTORY_ITEMS;
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save history to local storage:", error);
  }
}

/**
 * Clears the entire generation history from local storage.
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history from local storage:", error);
  }
}
