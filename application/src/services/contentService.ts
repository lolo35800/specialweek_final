import { api } from './api'
import type { Lesson, GalleryItem, Rule } from '../types/content'
import { fallback } from '../data/fallback'

export async function getLessons(): Promise<Lesson[]> {
  try {
    const data = await api.get<{ lessons: Lesson[] }>('/content/lessons')
    return data.lessons
  } catch {
    return fallback.lessons
  }
}

export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const data = await api.get<{ items: GalleryItem[] }>('/content/gallery')
    return data.items
  } catch {
    return fallback.gallery
  }
}

export async function getRules(): Promise<Rule[]> {
  try {
    const data = await api.get<{ rules: Rule[] }>('/rules')
    return data.rules
  } catch {
    return fallback.rules
  }
}
