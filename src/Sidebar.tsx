import { Link } from 'react-router-dom'
import { Sidebar as FbSidebar } from 'flowbite-react'
import {
  IdentificationIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import ROUTES from './routes'
interface SidebarProps {
  logout?: () => void
}

export function Sidebar({ logout }: SidebarProps) {
  return (
    <div className="w-fit">
      <FbSidebar>
        <FbSidebar.Logo href="#" img="favicon.ico" imgAlt="lnpass logo">
          lnpass
        </FbSidebar.Logo>
        <FbSidebar.Items>
          <FbSidebar.ItemGroup>
            <Link to={ROUTES.home}>
              <FbSidebar.Item as={'span'} icon={IdentificationIcon}>
                Identities
              </FbSidebar.Item>
            </Link>
          </FbSidebar.ItemGroup>
          <FbSidebar.ItemGroup>
            <Link to={ROUTES.export}>
              <FbSidebar.Item as={'span'} icon={DocumentArrowDownIcon}>
                Export
              </FbSidebar.Item>
            </Link>
            <FbSidebar.Item as={'span'} icon={DocumentArrowUpIcon}>
              Import
            </FbSidebar.Item>
          </FbSidebar.ItemGroup>
          {logout && (
            <FbSidebar.ItemGroup>
              <div className="cursor-pointer">
                <FbSidebar.Item as={'span'} icon={ArrowLeftOnRectangleIcon} onClick={() => logout()}>
                  Logout
                </FbSidebar.Item>
              </div>
            </FbSidebar.ItemGroup>
          )}
        </FbSidebar.Items>
      </FbSidebar>
    </div>
  )
}
