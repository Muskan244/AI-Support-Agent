import { writable } from 'svelte/store';
import type { Message } from './types';

function createSessionStore() {
  const STORAGE_KEY = 'techstyle_session_id';

  const storedValue = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY)
    : null;

  const { subscribe, set, update } = writable<string | null>(storedValue);

  return {
    subscribe,
    set: (value: string | null) => {
      if (typeof window !== 'undefined') {
        if (value) {
          localStorage.setItem(STORAGE_KEY, value);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      set(value);
    },
    clear: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set(null);
    }
  };
}

function createMessagesStore() {
  const { subscribe, set, update } = writable<Message[]>([]);

  return {
    subscribe,
    set,
    addMessage: (message: Message) => {
      update(messages => [...messages, message]);
    },
    clear: () => set([])
  };
}

export const isLoading = writable(false);

export const errorMessage = writable<string | null>(null);

export const sessionId = createSessionStore();
export const messages = createMessagesStore();
