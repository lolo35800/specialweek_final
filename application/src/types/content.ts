export interface Lesson {
  id: string
  titre: string
  description: string
  contenu: string
  ordre: number
  duree_min: number
  icone: string
}

export interface SuspectZone {
  x: number   // % relatif
  y: number
  w: number
  h: number
  description: string
}

export interface GalleryItem {
  id: number
  titre: string
  type: 'image' | 'post' | 'video_thumb'
  image_url: string
  zones_suspectes: SuspectZone[]
  indices: string[]
  explication: string
}

export interface Rule {
  id: number
  titre: string
  description: string
  icone: string
}
