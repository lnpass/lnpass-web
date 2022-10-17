import { Button, Sidebar as FbSidebar, Tooltip } from 'flowbite-react'

import { IdentificationIcon, DocumentArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid'
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
            <FbSidebar.Item href="#" icon={IdentificationIcon}>
              Identities
            </FbSidebar.Item>
          </FbSidebar.ItemGroup>
          <FbSidebar.ItemGroup>
            <FbSidebar.Item href="#" icon={DocumentArrowDownIcon}>
              Export
            </FbSidebar.Item>
            <FbSidebar.Item href="#" icon={DocumentArrowUpIcon}>
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
