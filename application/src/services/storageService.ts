import { supabase } from '../lib/supabase'

// Upload dans post-images (posts) ou avatars (profils)
export async function uploadImage(file: File, pathPrefix: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const isAvatar = pathPrefix.startsWith('avatars/')
  
  // Si c'est un avatar, on enlève le préfixe "avatars/" pour le chemin interne du bucket si on utilise un bucket dédié
  // Mais ici on va garder la logique simple : le bucket est déterminé par le type
  const bucket = isAvatar ? 'avatars' : 'post-images'
  
  // Pour les avatars, on utilise l'ID utilisateur comme nom de fichier unique (upsert)
  // Pour les posts, on garde un timestamp pour éviter les collisions
  const filePath = isAvatar
    ? `${pathPrefix.replace('avatars/', '')}.${ext}`
    : `${pathPrefix}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { 
      cacheControl: '3600', 
      upsert: true // Toujours écraser pour les profils, et pas de souci pour les nouveaux posts (timestamp)
    })

  if (error) {
    // Si le bucket 'avatars' n'existe pas, on tente de replier sur 'post-images'
    const isBucketNotFound = error.message.toLowerCase().includes('bucket not found')
    if (isAvatar && isBucketNotFound) {
      console.warn("Bucket 'avatars' non trouvé, repli sur 'post-images'")
      const fallbackPath = `${pathPrefix}.${ext}`
      const { error: err2 } = await supabase.storage
        .from('post-images')
        .upload(fallbackPath, file, { cacheControl: '3600', upsert: true })
      
      if (err2) {
        // Si post-images ne marche pas non plus, ou autre erreur
        console.error("Échec du repli sur 'post-images':", err2)
        throw err2
      }
      
      const { data } = supabase.storage.from('post-images').getPublicUrl(fallbackPath)
      return data.publicUrl
    }
    throw error
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}
