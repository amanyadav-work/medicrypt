import { AppSidebar } from "@/components/app-sidebar"
import AutoBreadcrumbs from "@/components/ui/AutoBreadCrumps"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/theme-toggle"

const MainLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='relative !no-scrollbar '>
        <header
          className="flex sticky bg-background z-50 border-b top-0 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 w-full flex-1 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <div className="flex-1 flex w-full items-center justify-between">
              <AutoBreadcrumbs />
              <ModeToggle />
            </div>
          </div>
        </header>
        <div className="flex no-scrollbar flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout