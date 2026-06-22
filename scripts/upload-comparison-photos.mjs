import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dir, '..')

const sb = createClient(
  'https://muvmoyxtfmhoztilaafg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dm1veXh0Zm1ob3p0aWxhYWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA0OTA5NSwiZXhwIjoyMDk1NjI1MDk1fQ.-Znlq-OeOxYCNDtvKrvBtAd1p3Vm-XVguyzbD0jSQ-k',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TRAINER = '17af294f-5a7e-46ae-9823-6ad13a41e834'
const CLIENT  = 'c1000001-0000-0000-0000-000000000001' // Sarah Johnson
const ENTRY_BEFORE = 'e1aa0001-0000-0000-0000-000000000001' // Jan 10 — 82.4 kg
const ENTRY_AFTER  = 'e6aa0006-0000-0000-0000-000000000006' // Jun 7  — 74.3 kg

async function upload(localPath, storagePath) {
  const bytes = readFileSync(localPath)
  const { error } = await sb.storage.from('progress-photos').upload(storagePath, bytes, {
    contentType: 'image/png', upsert: true,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  console.log(`✓ uploaded → ${storagePath}`)
  return storagePath
}

async function main() {
  const beforePath = `${TRAINER}/${CLIENT}/before.png`
  const afterPath  = `${TRAINER}/${CLIENT}/after.png`

  await upload(resolve(ROOT, 'public/blured-face-examples/example-before.png'), beforePath)
  await upload(resolve(ROOT, 'public/blured-face-examples/example-after.png'),  afterPath)

  // Clear existing photos for both entries and insert new ones
  for (const [entryId, storagePath] of [[ENTRY_BEFORE, beforePath], [ENTRY_AFTER, afterPath]]) {
    await sb.from('progress_photos').delete().eq('entry_id', entryId)
    const { error } = await sb.from('progress_photos').insert({
      entry_id: entryId, storage_path: storagePath, photo_order: 0,
    })
    if (error) throw new Error(`Insert photo record: ${error.message}`)
    console.log(`✓ linked photo to entry ${entryId.slice(0, 8)}...`)
  }

  console.log('Done.')
}

main().catch(console.error)
