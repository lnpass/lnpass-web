interface AboutPageProps {
  name: string
  version: string
}

export function AboutPage({ name, version }: AboutPageProps) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">About</h2>
      <div className="text-lg text-slate-500 break-all">
        {name} {version}
      </div>

      <div className="mt-4"></div>
    </>
  )
}
