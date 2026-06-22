// Run: node scripts/seed-demo-media.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://muvmoyxtfmhoztilaafg.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dm1veXh0Zm1ob3p0aWxhYWZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA0OTA5NSwiZXhwIjoyMDk1NjI1MDk1fQ.-Znlq-OeOxYCNDtvKrvBtAd1p3Vm-XVguyzbD0jSQ-k'
const TRAINER_ID = '17af294f-5a7e-46ae-9823-6ad13a41e834'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const CLIENTS = [
  { id: 'c1000001-0000-0000-0000-000000000001', name: 'Sarah Johnson',  email: 'sarah.johnson@example.com',  phone: '+1 (555) 101-2020', goal: 'Weight loss — target: -12 kg in 5 months',               avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'c2000002-0000-0000-0000-000000000002', name: 'Michael Chen',   email: 'michael.chen@example.com',   phone: '+1 (555) 202-3030', goal: 'Muscle gain — target: +8 kg lean mass in 6 months',      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'c3000003-0000-0000-0000-000000000003', name: 'Emma Williams',  email: 'emma.williams@example.com',  phone: '+1 (555) 303-4040', goal: 'Body recomposition and improved fitness before summer',   avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: 'c4000004-0000-0000-0000-000000000004', name: 'James Miller',   email: 'james.miller@example.com',   phone: '+1 (555) 404-5050', goal: 'Lower back rehab and core strengthening',                avatarUrl: 'https://randomuser.me/api/portraits/men/77.jpg' },
  { id: 'c5000005-0000-0000-0000-000000000005', name: 'Olivia Davis',   email: 'olivia.davis@example.com',   phone: '+1 (555) 505-6060', goal: '10 km run preparation — race in October 2026',           avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg' },
]

// 6-month weight loss journey for Sarah
const PROGRESS = [
  { id: 'e1aa0001-0000-0000-0000-000000000001', date: '2026-01-10', weight_kg: 82.4, notes: 'Starting point — initial measurements taken',
    measurements: { chest: 92, waist: 78, hips: 99, bicep: 31, thigh: 63, calf: 38 },
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'e2aa0002-0000-0000-0000-000000000002', date: '2026-02-07', weight_kg: 80.1, notes: 'Lost 2.3 kg — feeling more energetic',
    measurements: { chest: 91, waist: 76, hips: 97, bicep: 30, thigh: 62, calf: 37 }, photoUrl: null },
  { id: 'e3aa0003-0000-0000-0000-000000000003', date: '2026-03-08', weight_kg: 78.6, notes: 'Waist plateau — added 2× cardio per week',
    measurements: { chest: 90, waist: 75, hips: 95, bicep: 30, thigh: 61, calf: 37 }, photoUrl: null },
  { id: 'e4aa0004-0000-0000-0000-000000000004', date: '2026-04-05', weight_kg: 77.2, notes: null,
    measurements: { chest: 89, waist: 73, hips: 93, bicep: 29, thigh: 59, calf: 36 }, photoUrl: null },
  { id: 'e5aa0005-0000-0000-0000-000000000005', date: '2026-05-03', weight_kg: 75.8, notes: null,
    measurements: { chest: 88, waist: 71, hips: 92, bicep: 29, thigh: 58, calf: 36 }, photoUrl: null },
  { id: 'e6aa0006-0000-0000-0000-000000000006', date: '2026-06-07', weight_kg: 74.3, notes: '−8.1 kg in 5 months — amazing results!',
    measurements: { chest: 87, waist: 70, hips: 90, bicep: 28, thigh: 57, calf: 35 },
    photoUrl: 'https://randomuser.me/api/portraits/women/12.jpg' },
]

async function fetchBytes(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return new Uint8Array(await res.arrayBuffer())
}

async function uploadFile(bucket, path, bytes) {
  const { error } = await sb.storage.from(bucket).upload(path, bytes, { contentType: 'image/jpeg', upsert: true })
  if (error) throw new Error(`Upload ${bucket}/${path}: ${error.message}`)
}

async function main() {
  console.log('── Updating client names & uploading avatars ──')
  for (const c of CLIENTS) {
    // Upload avatar
    const bytes = await fetchBytes(c.avatarUrl)
    const storagePath = `${c.id}.jpg`
    await uploadFile('client-avatars', storagePath, bytes)

    // Update client row
    const { error } = await sb.from('clients').update({
      name: c.name,
      email: c.email,
      phone: c.phone,
      goal: c.goal,
      avatar_url: storagePath,
    }).eq('id', c.id)
    if (error) { console.error(`Client ${c.name}:`, error.message); continue }
    console.log(`✓ ${c.name}`)
  }

  console.log('\n── Updating session client names ──')
  // Also update any location name that's in Polish
  await sb.from('trainer_locations').update({ name: 'City Fitness Club' }).eq('id', 'ef505002-9a37-4407-ac36-328232be9d06')
  console.log('✓ Location renamed')

  console.log('\n── Adding progress entries for Sarah ──')
  for (const e of PROGRESS) {
    const { error } = await sb.from('progress_entries').upsert({
      id: e.id,
      client_id: 'c1000001-0000-0000-0000-000000000001',
      trainer_id: TRAINER_ID,
      date: e.date,
      weight_kg: e.weight_kg,
      measurements: e.measurements,
      notes: e.notes,
    }, { onConflict: 'id' })
    if (error) { console.error(`Entry ${e.date}:`, error.message); continue }

    // Upload photo for first and last entry
    if (e.photoUrl) {
      const bytes = await fetchBytes(e.photoUrl)
      const storagePath = `${TRAINER_ID}/c1000001-0000-0000-0000-000000000001/${e.id}_01.jpg`
      await uploadFile('progress-photos', storagePath, bytes)

      // Delete old photos for this entry if any
      await sb.from('progress_photos').delete().eq('entry_id', e.id)
      const { error: pe } = await sb.from('progress_photos').insert({
        entry_id: e.id,
        storage_path: storagePath,
        photo_order: 0,
      })
      if (pe) console.error(`Photo for ${e.date}:`, pe.message)
      else console.log(`✓ ${e.date} — ${e.weight_kg} kg + photo`)
    } else {
      console.log(`✓ ${e.date} — ${e.weight_kg} kg`)
    }
  }

  console.log('\nDone.')
}

main().catch(console.error)
