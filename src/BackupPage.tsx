import { useMemo } from 'react'
import { LnpassId } from './utils/lnpassId'
import { Tooltip } from 'flowbite-react'
import { StarIcon } from '@heroicons/react/24/outline'

interface BackupPageProps {
  lnpassId: LnpassId
  generateLoginHref: (id: LnpassId) => string
}

export function BackupPage({ lnpassId, generateLoginHref }: BackupPageProps) {
  const bookmark = useMemo(() => generateLoginHref(lnpassId), [lnpassId, generateLoginHref])

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tighter">Backup</h2>
      <div className="text-lg">
        Drag the following button into your toolbar, or save the link below to your bookmarks!
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {bookmark && (
          <div className="mt-4">
            <div className="text-lg font-bold">Bookmark Link:</div>
            <div className="w-fit">
              <Tooltip content="Drag me into your toolbar!">
                <a
                  href={bookmark}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-800 focus:!ring-2 border-0 group flex h-min items-center justify-center p-0.5 text-center font-medium focus:z-10 rounded-lg"
                >
                  <span className="flex items-center bg-white text-gray-900 transition-all duration-75 ease-in group-hover:bg-opacity-0 group-hover:text-inherit dark:bg-gray-900 dark:text-white rounded-md text-xs px-2 py-1 border border-transparent">
                    <StarIcon className="h-6 w-6 mr-3" />
                    Bookmark
                  </span>
                </a>
              </Tooltip>
            </div>
          </div>
        )}

        {bookmark && (
          <div className="mt-4">
            <div className="text-lg font-bold">Backup Link:</div>
            <div className="text-lg text-slate-500 break-all">{bookmark}</div>
          </div>
        )}

        <div className="mt-4">
          <div className="text-lg font-bold">lnpass ID:</div>
          <div className="text-lg text-slate-500 break-all">{lnpassId}</div>
        </div>
      </div>
    </>
  )
}
