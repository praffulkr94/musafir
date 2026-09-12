import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Memory, MemoryInput, Photo } from '../types'

type MemoriesState = {
  memories: Memory[]
  addMemory: (input: MemoryInput) => Memory
  updateMemory: (id: string, input: MemoryInput) => void
  /** Stores a photo resolved after the memory was saved. */
  setMemoryPhoto: (id: string, photo: Photo) => void
  deleteMemory: (id: string) => void
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const useMemories = create<MemoriesState>()(
  persist(
    (set) => ({
      memories: [],
      addMemory: (input) => {
        const memory: Memory = { ...input, id: newId(), createdAt: new Date().toISOString() }
        set((s) => ({ memories: [...s.memories, memory] }))
        return memory
      },
      updateMemory: (id, input) =>
        set((s) => ({
          memories: s.memories.map((m) => (m.id === id ? { ...m, ...input, id, createdAt: m.createdAt } : m)),
        })),
      setMemoryPhoto: (id, photo) =>
        set((s) => {
          const current = s.memories.find((m) => m.id === id)
          // Already resolved: keep the state identical so nothing re-renders.
          if (!current || current.imageUrl === photo.imageUrl) return s
          return { memories: s.memories.map((m) => (m.id === id ? { ...m, ...photo } : m)) }
        }),
      deleteMemory: (id) => set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
    }),
    { name: 'musafir.memories', version: 1 },
  ),
)
