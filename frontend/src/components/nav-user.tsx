import { useState, useRef, useEffect } from "react"
import {
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
  onLogout,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  onLogout?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  let isMobile = false;
  
  console.log('NavUser render, isOpen:', isOpen)
  
  // Try to use sidebar hook, but fallback if it fails
  try {
    const sidebar = useSidebar()
    isMobile = sidebar.isMobile
  } catch {
    console.warn('useSidebar hook failed, using fallback')
    isMobile = false
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('Clicking outside, closing dropdown')
        setIsOpen(false)
      }
    }

    if (isOpen) {
      console.log('Adding click outside listener')
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        console.log('Removing click outside listener')
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    setIsOpen(false)
    if (onLogout) {
      onLogout()
    }
  }

  const toggleDropdown = () => {
    console.log('Dropdown toggle clicked, current state:', isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="relative" ref={dropdownRef}>
          <SidebarMenuButton
            size="lg"
            className={`w-full ${isOpen ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
            onClick={toggleDropdown}
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-sm">{user.name}</span>
              <span className="truncate text-xs font-medium text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
          
          {isOpen && (
            <div
              className={`absolute z-[9999] w-56 rounded-lg border bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${
                isMobile ? 'bottom-full mb-2 left-0' : 'right-0 top-full mt-2'
              }`}
              style={{ 
                position: 'absolute',
                zIndex: 9999,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs font-medium text-gray-500">{user.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
