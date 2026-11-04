import { useRef, useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Modal } from '@/components/Modal'
import { exportElementAsPdf, exportElementAsPng } from '@/lib/exportPdf'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { certificateTemplates } from './certificateTemplates'
import { CertificateCard } from './CertificateCard'

/** Kid-facing gallery of every certificate they've earned — tap one to see it full-size. */
export function TrophyShelfPage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const certificates = useStore((s) => s.certificates)
  const settings = useStore((s) => s.settings)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet.</p>
        </Card>
      </div>
    )
  }

  const rates = kid.rates ?? settings.rates
  const trophies = Object.values(certificates)
    .filter((c) => c.kidId === kid.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
  const previewCert = previewId ? certificates[previewId] : undefined

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/" label="Home" />
      <h1 className="font-display text-3xl text-slate-800">Trophy Shelf 🏆</h1>
      {trophies.length === 0 && (
        <Card>
          <p className="text-slate-600">No trophies yet — keep going, your first one's coming!</p>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3">
        {trophies.map((cert) => {
          const template = certificateTemplates[cert.type]
          return (
            <button key={cert.id} type="button" onClick={() => setPreviewId(cert.id)}>
              <Card
                className={`flex flex-col items-center gap-1 bg-gradient-to-br py-6 text-center text-white ${template.gradient}`}
              >
                <span className="text-4xl">{template.icon}</span>
                <span className="font-display">{cert.title}</span>
              </Card>
            </button>
          )
        })}
      </div>

      <Modal open={previewCert !== undefined} onClose={() => setPreviewId(null)} title="">
        {previewCert && (
          <div className="space-y-3">
            <div ref={previewRef}>
              <CertificateCard certificate={previewCert} kid={kid} parentName={settings.parentName} rates={rates} />
            </div>
            <div className="flex gap-2">
              <Button
                variant="sky"
                className="flex-1"
                onClick={() => previewRef.current && exportElementAsPng(previewRef.current, previewCert.title)}
              >
                PNG
              </Button>
              <Button
                variant="grape"
                className="flex-1"
                onClick={() => previewRef.current && exportElementAsPdf(previewRef.current, previewCert.title, 'letter')}
              >
                PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
