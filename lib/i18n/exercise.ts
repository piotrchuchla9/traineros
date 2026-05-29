import type { Exercise } from '@/types/database'
import type { Locale } from './translations'

export function exName(ex: Exercise, locale: Locale): string {
  return (locale === 'en' && ex.name_en) ? ex.name_en : ex.name
}

export function exDesc(ex: Exercise, locale: Locale): string | null {
  return (locale === 'en' && ex.description_en) ? ex.description_en : ex.description
}
