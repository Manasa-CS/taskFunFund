import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

const PAGE_SIZES_PT = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
} as const

/** Renders a DOM element to a PNG data URL at 2x for crisp export/print. */
async function renderElementToPng(element: HTMLElement): Promise<string> {
  return toPng(element, { pixelRatio: 2, backgroundColor: '#ffffff' })
}

/** Shares a file (native) or downloads it (web) via a temporary object/data URL. */
async function shareOrDownload(blob: Blob, filename: string, mimeExt: 'pdf' | 'png'): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob)
    const path = `${filename}.${mimeExt}`
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache })
    const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache })
    await Share.share({ title: filename, url: uri })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${mimeExt}`
    a.click()
    URL.revokeObjectURL(url)
  }
}

/** Exports a DOM element as a PNG image, shared (native) or downloaded (web). */
export async function exportElementAsPng(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await renderElementToPng(element)
  const blob = await (await fetch(dataUrl)).blob()
  await shareOrDownload(blob, filename, 'png')
}

/**
 * Exports a DOM element as a PDF, shared (native) or downloaded (web).
 * `pageSize: 'fit'` sizes the page to the element (good for reports); 'a4'/'letter'
 * centers the image on a standard printable page (good for certificates).
 */
export async function exportElementAsPdf(
  element: HTMLElement,
  filename: string,
  pageSize: 'fit' | 'a4' | 'letter' = 'fit',
): Promise<void> {
  const dataUrl = await renderElementToPng(element)
  const { width, height } = element.getBoundingClientRect()

  let pdf: jsPDF
  if (pageSize === 'fit') {
    pdf = new jsPDF({ orientation: width >= height ? 'landscape' : 'portrait', unit: 'px', format: [width, height] })
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
  } else {
    const page = PAGE_SIZES_PT[pageSize]
    const isLandscape = width >= height
    const pageWidth = isLandscape ? page.height : page.width
    const pageHeight = isLandscape ? page.width : page.height
    pdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'pt', format: pageSize })

    const margin = 36 // 0.5in
    const maxW = pageWidth - margin * 2
    const maxH = pageHeight - margin * 2
    const scale = Math.min(maxW / width, maxH / height)
    const drawW = width * scale
    const drawH = height * scale
    const x = (pageWidth - drawW) / 2
    const y = (pageHeight - drawH) / 2
    pdf.addImage(dataUrl, 'PNG', x, y, drawW, drawH)
  }

  const blob = pdf.output('blob')
  await shareOrDownload(blob, filename, 'pdf')
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
