const STORAGE_KEY = 'jojo_stand_history';
const MAX_ITEMS = 50; // Increased limit

const safeUUID = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    // Fallback for insecure contexts or older browsers
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

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
  const current = getHistory();
  try {
    if (!standData || !standData.name) {
      console.warn("Attempted to save invalid stand data", standData);
      return current;
    }

    // Avoid duplicates by name + ability name check
    const isDuplicate = current.some(item =>
      item.name === standData.name && item.abilityName === standData.abilityName
    );

    if (isDuplicate) {
      console.log("Duplicate Stand detected, skipping save:", standData.name);
      return current;
    }

    const newItem = {
      ...standData,
      timestamp: Date.now(),
      id: safeUUID()
    };

    // Try normal save
    try {
      const updated = [newItem, ...current].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log("Stand saved to History:", newItem.name);
      return updated;
    } catch (quotaError) {
      // If Quota Exceeded (likely due to Base64 image), try saving without image
      if (quotaError.name === 'QuotaExceededError' || quotaError.message.includes('quota')) {
        console.warn("LocalStorage Quota Exceeded. Retrying without image...");

        const textOnlyItem = { ...newItem, imageUrl: null, imageFailed: true };
        const updatedTextOnly = [textOnlyItem, ...current].slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTextOnly));
        console.log("Stand text profile saved (Image dropped due to size limits).");
        return updatedTextOnly;
      }
      throw quotaError; // Re-throw other errors
    }
  } catch (e) {
    console.error("Failed to save history", e);
    // Return current state so we don't wipe UI on error
    return current;
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};
