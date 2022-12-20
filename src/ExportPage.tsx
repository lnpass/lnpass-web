import { useMemo, useState } from 'react'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { LnpassId } from './utils/lnpassId'

interface ExportData {
  version: string
  lnpassId: LnpassId
  accounts: {
    index: number
    name: string
    description: string
  }[]
}
interface DownloadLinkProps {
  blob: Blob
  fileName: string
}

function DownloadLink({ blob, fileName }: DownloadLinkProps) {
  const href = useMemo(() => URL.createObjectURL(blob), [blob])

  return (
    <>
      <a
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        href={href}
        download={fileName}
      >
        Download
      </a>
    </>
  )
}

interface ExportPageProps {
  lnpassId: LnpassId
}

export function ExportPage({ lnpassId }: ExportPageProps) {
  const [exportVersion] = useState('1')
  const exportData: ExportData = useMemo(
    () => ({
      version: exportVersion,
      lnpassId,
      accounts: [],
    }),
    [exportVersion, lnpassId]
  )

  const blob = useMemo(() => {
    const text = JSON.stringify(exportData, null, 2)
    return new Blob([text], { type: 'text/plain' })
  }, [exportData])

  const fileName = useMemo(() => {
    const id = `${exportVersion}${bytesToHex(sha256(sha256(lnpassId))).substring(0, 7)}`
    return `lnpass_${id}.json`
  }, [exportVersion, lnpassId])

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Export</h2>
      <div className="text-lg text-slate-500 break-all">{lnpassId}</div>

      <div className="mt-4">
        <DownloadLink blob={blob} fileName={fileName} />
      </div>
    </>
  )
}
