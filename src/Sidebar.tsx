import { Button, Sidebar as FbSidebar, Tooltip } from 'flowbite-react'

import { IdentificationIcon, DocumentArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
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
            <Link to="/">
              <FbSidebar.Item as={'span'} icon={IdentificationIcon}>
                Identities
              </FbSidebar.Item>
            </Link>
          </FbSidebar.ItemGroup>
          <FbSidebar.ItemGroup>
            <Link to="/export">
              <FbSidebar.Item as={'span'} icon={DocumentArrowDownIcon}>
                Export
              </FbSidebar.Item>
            </Link>
            <FbSidebar.Item as={'span'} icon={DocumentArrowUpIcon}>
              Import
            </FbSidebar.Item>
          </FbSidebar.ItemGroup>
        </FbSidebar.Items>
        {logout && (
          <div className="mt-4">
            <Tooltip content="Forget identities and logout!">
              <Button outline={true} gradientDuoTone="purpleToBlue" onClick={() => logout()}>
                Logout
              </Button>
            </Tooltip>
          </div>
        )}
      </FbSidebar>
    </div>
  )
}
