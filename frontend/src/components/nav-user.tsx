'use client'

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronsUpDown, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'

type NavUserProps = {
  user: { name: string; email: string; avatar: string }
  onLogout?: () => void
}

export function NavUser({ user, onLogout }: NavUserProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false) // evita mismatch con SSR
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  useEffect(() => setMounted(true), [])

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0]!)
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const handleLogout = () => {
    setIsOpen(false)
    onLogout?.()
  }

  const placeDropdown = () => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const gap = 8

    // 1ª pasada: usar ancho fallback para evitar salto visual
    let width = 224
    let left = rect.right - width
    left = Math.max(gap, Math.min(left, window.innerWidth - width - gap))
    setPos({ top: rect.bottom + gap, left })

    // 2ª pasada: medir ancho real ya montado y recolocar
    requestAnimationFrame(() => {
      width = dropdownRef.current?.offsetWidth ?? width
      left = rect.right - width
      left = Math.max(gap, Math.min(left, window.innerWidth - width - gap))
      setPos({ top: rect.bottom + gap, left })
    })
  }

  useEffect(() => {
    if (!isOpen) return
    placeDropdown()

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (buttonRef.current?.contains(t) || dropdownRef.current?.contains(t)) return
      setIsOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    const onScroll = () => placeDropdown()
    const onResize = () => placeDropdown()

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen])

  const toggleDropdown = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen((v) => !v)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={`flex items-center w-full p-2 rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            isOpen ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
          }`}
          onClick={toggleDropdown}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight ml-2">
            <span className="truncate font-semibold text-sm">{user.name}</span>
            <span className="truncate text-xs font-medium text-muted-foreground">
              {user.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4" />
        </button>

        {isOpen &&
          mounted &&
          createPortal(
            <div
              ref={dropdownRef}
              role="menu"
              aria-label="Usuario"
              className="fixed z-[9999] w-56 rounded-lg border bg-white shadow-lg"
              style={{ top: pos.top, left: pos.left }}
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
                    <span className="truncate text-xs font-medium text-gray-500">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>,
            document.body
          )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
