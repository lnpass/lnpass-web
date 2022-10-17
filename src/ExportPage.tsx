import { LnpassId } from './utils/lnpassId'

interface ExportPageProps {
  lnpassId: LnpassId
}

export function ExportPage({ lnpassId }: ExportPageProps) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Export</h2>
      <div className="text-lg text-slate-500">{lnpassId}</div>
    </>
  )
}
