import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

// Custom storage engine for Zustand using idb-keyval
const idbStorage = {
  getItem: async (name) => {
    return (await get(name)) || null;
  },
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};

export const useSyncStore = create(
  persist(
    (set, getStore) => ({
      offlineQueue: [], // Array of { localId, payload, status: 'pending' | 'failed', error: null, createdAt }
      dailyLocalTokenCounter: 0,
      dailyLocalOrderCounter: 0,
      lastDate: new Date().toDateString(),

      // Get next local IDs for offline printing
      getNextLocalIds: () => {
        const today = new Date().toDateString();
        let { dailyLocalTokenCounter, dailyLocalOrderCounter, lastDate } = getStore();

        if (today !== lastDate) {
          dailyLocalTokenCounter = 0;
          dailyLocalOrderCounter = 0;
        }

        const nextToken = dailyLocalTokenCounter + 1;
        const nextOrder = dailyLocalOrderCounter + 1;

        set({
          dailyLocalTokenCounter: nextToken,
          dailyLocalOrderCounter: nextOrder,
          lastDate: today,
        });

        return {
          localTokenNo: `L-${nextToken}`,
          localOrderNo: `L-ORD-${nextOrder}`,
        };
      },

      addToQueue: (payload) => {
        set((state) => ({
          offlineQueue: [
            ...state.offlineQueue,
            {
              localId: payload.localId,
              payload,
              status: "pending",
              error: null,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateQueueItem: (localId, newPayload) => {
        set((state) => ({
          offlineQueue: state.offlineQueue.map((item) =>
            item.localId === localId
              ? { ...item, payload: newPayload, status: "pending", error: null }
              : item
          ),
        }));
      },

      removeFromQueue: (localId) => {
        set((state) => ({
          offlineQueue: state.offlineQueue.filter(
            (item) => item.localId !== localId
          ),
        }));
      },

      markFailed: (localId, error) => {
        set((state) => ({
          offlineQueue: state.offlineQueue.map((item) =>
            item.localId === localId
              ? { ...item, status: "failed", error: error?.message || String(error) }
              : item
          ),
        }));
      },
      
      markPending: (localId) => {
        set((state) => ({
          offlineQueue: state.offlineQueue.map((item) =>
            item.localId === localId
              ? { ...item, status: "pending", error: null }
              : item
          ),
        }));
      },

      clearQueue: () => set({ offlineQueue: [] }),
    }),
    {
      name: "pos-sync-storage",
      storage: idbStorage,
      partialize: (state) => 
        Object.fromEntries(
          Object.entries(state).filter(([key, value]) => typeof value !== 'function')
        ),
    }
  )
);
