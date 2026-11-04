import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import type { Certificate } from '../types'

export interface CertificatesSlice {
  certificates: Record<string, Certificate>
  addCertificate: (certificate: Omit<Certificate, 'id'>) => string
  removeCertificate: (id: string) => void
}

export const createCertificatesSlice: StateCreator<CertificatesSlice, [], [], CertificatesSlice> = (
  set,
) => ({
  certificates: {},

  addCertificate: (certificate) => {
    const id = makeId()
    set((state) => ({ certificates: { ...state.certificates, [id]: { ...certificate, id } } }))
    return id
  },

  removeCertificate: (id) =>
    set((state) => {
      const next = { ...state.certificates }
      delete next[id]
      return { certificates: next }
    }),
})
