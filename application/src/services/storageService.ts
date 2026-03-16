import { supabase } from '../lib/supabase'

// Upload dans post-images (posts) ou avatars (profils)
// path peut être un chemin complet ex: "avatars/userId" ou juste userId pour les posts
export async function uploadImage(file: File, pathPrefix: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const isAvatar = pathPrefix.startsWith('avatars/')
  const bucket = 'post-images'
  const filePath = isAvatar
    ? `${pathPrefix}.${ext}`                      // avatars/userId.jpg (upsert)
    : `${pathPrefix}/${Date.now()}.${ext}`         // userId/timestamp.jpg

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: isAvatar })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}
