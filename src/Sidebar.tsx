import { Link } from 'react-router-dom'
import { Sidebar as FbSidebar, Tooltip } from 'flowbite-react'
import {
  IdentificationIcon,
  DocumentArrowDownIcon,
  ArrowLeftOnRectangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import ROUTES from './routes'

interface SidebarProps {
  bookmark?: string
  logout?: () => void
}

export function Sidebar({ bookmark, logout }: SidebarProps) {
  return (
    <div className="w-fit">
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
            {bookmark && (
              <Tooltip content="Drag me into your toolbar!">
                <a href={bookmark}>
                  <FbSidebar.Item as={'span'} icon={StarIcon}>
                    Bookmark
                  </FbSidebar.Item>
                </a>
              </Tooltip>
            )}
            <Link to={ROUTES.export}>
              <FbSidebar.Item as={'span'} icon={DocumentArrowDownIcon}>
                Export
              </FbSidebar.Item>
            </Link>
            {/*<FbSidebar.Item as={'span'} icon={DocumentArrowUpIcon}>
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
