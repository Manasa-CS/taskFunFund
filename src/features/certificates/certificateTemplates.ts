import type { CertificateType } from '@/store/types'

export interface CertificateTemplate {
  icon: string
  gradient: string
  label: string
}

export const certificateTemplates: Record<CertificateType, CertificateTemplate> = {
  taskHero: { icon: '🦸', gradient: 'from-sky-300 to-sky-500', label: 'Task Hero' },
  fundBuilder: { icon: '🏦', gradient: 'from-mint-300 to-mint-500', label: 'Fund Builder' },
  superSaver: { icon: '🐷', gradient: 'from-grape-300 to-grape-500', label: 'Super Saver' },
  goalGetter: { icon: '🎯', gradient: 'from-coral-400 to-grape-500', label: 'Goal Getter' },
  superLearner: { icon: '🧠', gradient: 'from-coral-300 to-coral-500', label: 'Super Learner' },
  streakMaster: { icon: '🔥', gradient: 'from-sunny-300 to-sunny-500', label: 'Streak Master' },
  custom: { icon: '🏆', gradient: 'from-slate-300 to-slate-500', label: 'Custom Award' },
}
