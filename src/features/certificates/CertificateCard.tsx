import { avatarEmoji } from '@/features/kids/avatars'
import { formatMoney } from '@/lib/fund'
import type { Certificate, Kid, Rates } from '@/store/types'
import { certificateTemplates } from './certificateTemplates'

interface CertificateCardProps {
  certificate: Certificate
  kid: Kid
  parentName: string
  rates: Rates
}

/** The printable certificate itself: achievement, kid's name and avatar, fund snapshot, and a signature line. */
export function CertificateCard({ certificate, kid, parentName, rates }: CertificateCardProps) {
  const template = certificateTemplates[certificate.type]

  return (
    <div className={`rounded-3xl border-8 border-double border-white bg-gradient-to-br ${template.gradient} p-8 text-center text-white shadow-lg`}>
      <p className="text-6xl">{template.icon}</p>
      <p className="font-display mt-2 text-sm uppercase tracking-widest opacity-90">Certificate of Achievement</p>
      <h2 className="font-display mt-1 text-3xl">{certificate.title}</h2>

      <div className="my-4 flex items-center justify-center gap-2">
        <span className="text-3xl">{avatarEmoji(kid.avatar)}</span>
        <span className="font-display text-2xl">{kid.name}</span>
      </div>

      <p className="mx-auto max-w-sm text-sm opacity-95">{certificate.message}</p>

      <p className="mt-4 font-display text-lg">
        {certificate.pointsSnapshot} pts · {certificate.starsSnapshot} ⭐ ·{' '}
        {formatMoney(certificate.moneyUnitsSnapshot, rates)}
      </p>

      <p className="mt-2 text-xs opacity-80">{certificate.dateRangeLabel}</p>

      <div className="mt-6 border-t border-white/50 pt-2 text-xs opacity-90">
        Signed by {parentName || 'Parent'} · {new Date(certificate.issuedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
