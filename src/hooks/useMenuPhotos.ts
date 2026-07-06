// =============================================================================
// useMenuPhotos.ts — Speisekarten-Fotos je Lokal in IndexedDB (v0.4).
// So entsteht über den Urlaub die eigene Karte mit echten Preisen — offline.
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { del, get, set as idbSet } from 'idb-keyval'

export interface MenuPhoto {
  id: string
  /** dataURL für <img>. */
  dataUrl: string
  addedAt: number
}

function keyFor(spotId: string): string {
  return `zyp2026:menu-photos:${spotId}`
}

export function useMenuPhotos(spotId: string) {
  const [photos, setPhotos] = useState<MenuPhoto[]>([])

  useEffect(() => {
    void get<MenuPhoto[]>(keyFor(spotId)).then((p) => setPhotos(p ?? []))
  }, [spotId])

  const persist = useCallback(
    async (next: MenuPhoto[]) => {
      setPhotos(next)
      await idbSet(keyFor(spotId), next)
    },
    [spotId],
  )

  const addPhoto = useCallback(
    async (file: File) => {
      // Auf max 800px verkleinern (Canvas), um IndexedDB nicht vollzumüllen.
      const dataUrl = await resizeImage(file, 800)
      const photo: MenuPhoto = { id: `ph-${Date.now()}`, dataUrl, addedAt: Date.now() }
      await persist([...photos, photo])
    },
    [photos, persist],
  )

  const removePhoto = useCallback(
    async (id: string) => {
      const next = photos.filter((p) => p.id !== id)
      await persist(next)
      void del(id).catch(() => {})
    },
    [photos, persist],
  )

  return { photos, addPhoto, removePhoto }
}

/** Verkleinert ein Bild auf maxWidth via Canvas; liefert dataURL (JPEG). */
async function resizeImage(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas nicht verfügbar'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
