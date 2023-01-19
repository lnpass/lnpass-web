interface AboutPageProps {
  version: string
}

export function AboutPage({ version }: AboutPageProps) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">About</h2>
      <div className="text-lg text-slate-500 break-all">lnpass {version}</div>

      <div className="mt-4"></div>
    </>
  )
}
