import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    roles?: string[]
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-semibold text-sm tracking-wide uppercase text-sidebar-foreground/70">
        Módulos
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isCurrentPage = location.pathname === item.url || location.pathname.startsWith(item.url + '/')
          const isOpen = openItems.includes(item.title) || isCurrentPage
          
          return (
            <SidebarMenuItem key={item.title}>
              {item.items && item.items.length > 0 ? (
                <Collapsible open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      className={`font-medium ${isCurrentPage ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : ""}`}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="font-medium">{item.title}</span>
                      <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubCurrentPage = location.pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild 
                              className={`font-medium ${isSubCurrentPage ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : ""}`}
                            >
                              <Link to={subItem.url}>
                                <span className="text-sm font-medium">{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton 
                  tooltip={item.title} 
                  asChild
                  className={`font-medium ${isCurrentPage ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : ""}`}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
