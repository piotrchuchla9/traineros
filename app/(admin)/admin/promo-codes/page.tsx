import { requireAdmin, getAdminSupabase } from '@/lib/admin'
import { PromoCodesClient } from './PromoCodesClient'

export default async function AdminPromoCodesPage() {
  await requireAdmin()
  const admin = getAdminSupabase()

  const { data: codes } = await admin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kody promo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kody dające przedłużony trial przy rejestracji lub ręcznym wprowadzeniu
        </p>
      </div>
      <PromoCodesClient codes={codes ?? []} />
    </div>
  )
}
