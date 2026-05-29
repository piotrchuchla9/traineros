import { cookies } from 'next/headers'
import { type Locale, getT } from './translations'

export async function getServerT() {
  const jar = await cookies()
  const lang = jar.get('lang')?.value
  const locale: Locale = lang === 'pl' || lang === 'en' ? lang : 'pl'
  return getT(locale)
}
