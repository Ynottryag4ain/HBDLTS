'use client'
import { create } from 'zustand'

export type AppScreen = 'lock' | 'cards' | 'cake' | 'letter' | 'photobooth' | 'gallery'

interface AppState {
  screen: AppScreen
  cakeBlown: boolean
  photos: string[]
  musicOn: boolean
  setScreen: (s: AppScreen) => void
  setCakeBlown: (v: boolean) => void
  addPhoto: (url: string) => void
  clearPhotos: () => void
  toggleMusic: () => void
}

export const useAppStore = create<AppState>((set) => ({
  screen: 'lock',
  cakeBlown: false,
  photos: [],
  musicOn: false,
  setScreen: (screen) => set({ screen }),
  setCakeBlown: (cakeBlown) => set({ cakeBlown }),
  addPhoto: (url) => set((s) => ({ photos: [...s.photos, url] })),
  clearPhotos: () => set({ photos: [] }),
  toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
}))
