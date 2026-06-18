export function isRestricted(trainer: { plan: string; trial_ends_at: string | null }): boolean {
  if (trainer.plan === 'inactive') return true
  if (trainer.plan === 'trial' && trainer.trial_ends_at) {
    return new Date(trainer.trial_ends_at) < new Date()
  }
  return false
}
