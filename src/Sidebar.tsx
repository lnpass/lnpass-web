import { Button, Sidebar as FbSidebar, Tooltip } from 'flowbite-react'

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
            <FbSidebar.Item href="#">Item 1</FbSidebar.Item>
          </FbSidebar.ItemGroup>
          <FbSidebar.ItemGroup>
            <FbSidebar.Item href="#">Item 2</FbSidebar.Item>
          </FbSidebar.ItemGroup>
        </FbSidebar.Items>
        {logout && (
          <div className="mt-4">
            <Tooltip content="Forget seed and logout!">
              <Button outline={true} gradientDuoTone="purpleToBlue" size="xl" onClick={() => logout()}>
                Logout
              </Button>
            </Tooltip>
          </div>
        )}
      </FbSidebar>
    </div>
  )
}
