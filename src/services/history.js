const STORAGE_KEY = 'jojo_stand_history';
const MAX_ITEMS = 10;

export const getHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const addToHistory = (standData) => {
  try {
    const current = getHistory();

    // Avoid duplicates by name + ability name check
    const isDuplicate = current.some(item =>
      item.name === standData.name && item.abilityName === standData.abilityName
    );

    if (isDuplicate) return current;

    const newItem = {
      ...standData,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    };

    const updated = [newItem, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save history", e);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};
