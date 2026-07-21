export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  timestamp: string;
}

export interface ConversationSummary {
  activeTopic: string;
  lastIntent: string;
  modifiedEntities: string[];
  keyNotes: string[];
}

const MEMORY_STORAGE_KEY = 'histolab_ai_memory_v1';

export function getAIMemory(): { items: MemoryItem[]; summary: ConversationSummary } {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load AI Memory', e);
  }
  return {
    items: [],
    summary: {
      activeTopic: 'Sejarah Indonesia',
      lastIntent: 'Mengajar',
      modifiedEntities: [],
      keyNotes: [],
    },
  };
}

export function saveAIMemoryNote(key: string, value: string) {
  const current = getAIMemory();
  const existingIdx = current.items.findIndex((i) => i.key === key);
  const newItem: MemoryItem = {
    id: `mem-${Date.now()}`,
    key,
    value,
    timestamp: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    current.items[existingIdx] = newItem;
  } else {
    current.items.push(newItem);
  }

  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(current));
  return current;
}

export function updateConversationSummary(updates: Partial<ConversationSummary>) {
  const current = getAIMemory();
  current.summary = {
    ...current.summary,
    ...updates,
  };
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(current));
  return current;
}
