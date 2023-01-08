import { Link } from 'react-router-dom'
import { Sidebar as FbSidebar } from 'flowbite-react'
import {
  IdentificationIcon,
  DocumentArrowDownIcon,
  ArrowLeftOnRectangleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import ROUTES from '../routes'

interface SidebarProps {
  elementId: string
  logout?: () => void
}

export function Sidebar({ elementId, logout }: SidebarProps) {
  return (
    <div
      id={elementId}
      className="absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out"
    >
      <FbSidebar>
        <FbSidebar.Logo href="#" img="favicon.ico" imgAlt="">
          lnpass
        </FbSidebar.Logo>
        <FbSidebar.Items>
          <FbSidebar.ItemGroup>
            <Link to={{ pathname: ROUTES.home }}>
              <FbSidebar.Item as={'span'} icon={IdentificationIcon}>
                Identities
              </FbSidebar.Item>
            </Link>
          </FbSidebar.ItemGroup>
          <FbSidebar.ItemGroup>
            <Link to={ROUTES.backup}>
              <FbSidebar.Item as={'span'} icon={DocumentArrowDownIcon}>
                Backup
              </FbSidebar.Item>
            </Link>
            <Link to={ROUTES.settings}>
              <FbSidebar.Item as={'span'} icon={WrenchScrewdriverIcon}>
                Settings
              </FbSidebar.Item>
            </Link>
            {/*<Link to={ROUTES.export}>
              <FbSidebar.Item as={'span'} icon={DocumentArrowDownIcon}>
                Export
              </FbSidebar.Item>
            </Link>
            <FbSidebar.Item as={'span'} icon={DocumentArrowUpIcon}>
              Import
            </FbSidebar.Item>*/}
          </FbSidebar.ItemGroup>

          <FbSidebar.ItemGroup>
            <div className="cursor-pointer">
              {logout && (
                <FbSidebar.Item as={'span'} icon={ArrowLeftOnRectangleIcon} onClick={() => logout()}>
                  Logout
                </FbSidebar.Item>
              )}
            </div>
          </FbSidebar.ItemGroup>
        </FbSidebar.Items>
      </FbSidebar>
    </div>
  )
}
