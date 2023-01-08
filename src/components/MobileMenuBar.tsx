import { useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ROUTES from '../routes'

interface MobileMenuBarProps {
  sidebarId: string
}

export function MobileMenuBar({ sidebarId }: MobileMenuBarProps) {
  const onClickToggleSidebarBtn = useCallback(() => {
    const sidebar = document.getElementById(sidebarId)
    sidebar?.classList.toggle('-translate-x-full')
  }, [sidebarId])

  useEffect(() => {
    const onClick = (event: Event) => {
      const mobileMenuButton = document.getElementById('mobile-menu-button')
      const sidebar = document.getElementById(sidebarId)

      const sidebarIsOpen = sidebar?.classList.contains('-translate-x-full')
      if (sidebarIsOpen) return

      const isButtonClick =
        mobileMenuButton === event.target || (event.target instanceof Node && mobileMenuButton?.contains(event.target))
      if (isButtonClick) return

      const isOutsideClick =
        sidebar !== event.target && event.target instanceof Node && !sidebar?.contains(event.target)

      if (isOutsideClick) {
        onClickToggleSidebarBtn()
      }
    }

    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [sidebarId, onClickToggleSidebarBtn])

  return (
    <>
      <div className="bg-gray-800 text-gray-100 flex justify-between md:hidden">
        <div className="flex items-center ml-2">
          <Link to={{ pathname: ROUTES.home }}>
            <img className="h-6 w-6" src="favicon.ico" alt="logo" style={{ filter: 'invert(21%)' }} />
          </Link>
        </div>

        <Link to={{ pathname: ROUTES.home }} className="block p-4 text-white font-bold">
          lnpass
        </Link>

        <button
          id="mobile-menu-button"
          className="mobile-menu-button p-4 focus:outline-none hover:bg-gray-700"
          onClick={onClickToggleSidebarBtn}
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </>
  )
}
