import { NavLink, useLocation } from 'react-router-dom'
import { Home, PlusCircle, Leaf, Menu, type LucideIcon } from 'lucide-react'

interface BottomNavProps {
  onOpenMenu: () => void
  isMenuOpen?: boolean
}

interface NavLinkItem {
  type: 'link'
  to: string
  label: string
  icon: LucideIcon
  title?: string
}

interface NavButtonItem {
  type: 'button'
  onClick: () => void
  label: string
  icon: LucideIcon
  isActive: boolean
  ariaLabel: string
}

type NavItem = NavLinkItem | NavButtonItem

export default function BottomNav({ onOpenMenu, isMenuOpen }: BottomNavProps) {
  const location = useLocation()
  const pathname = location.pathname

  const items: NavItem[] = [
    {
      type: 'link',
      to: '/home',
      label: 'Home',
      icon: Home,
    },
    {
      type: 'link',
      to: '/new-observation',
      label: 'New',
      icon: PlusCircle,
      title: 'New Observation',
    },
    {
      type: 'link',
      to: '/observations',
      label: 'Records',
      icon: Leaf,
    },
    {
      type: 'button',
      onClick: onOpenMenu,
      label: 'Menu',
      icon: Menu,
      isActive: Boolean(isMenuOpen),
      ariaLabel: 'Open secondary navigation menu',
    },
  ]

  const isItemActive = (item: NavItem): boolean => {
    if (item.type === 'button') {
      return item.isActive
    }
    if (item.to === '/home') {
      return pathname === '/home' || pathname === '/dashboard'
    }
    if (item.to === '/new-observation') {
      return pathname === '/new-observation'
    }
    if (item.to === '/observations') {
      return pathname.startsWith('/observations') || pathname.startsWith('/edit-observation')
    }
    return pathname === item.to
  }

  const renderItemContent = (Icon: LucideIcon, label: string, isActive: boolean) => (
    <div
      className={`flex flex-col items-center justify-center w-[68px] sm:w-[72px] h-[50px] rounded-2xl border transition-all duration-200 ease-out select-none ${
        isActive
          ? 'bg-[#133D2F] border-[#1C4D3C] text-[#A6F16A] shadow-[0_2px_12px_rgba(166,241,106,0.12)]'
          : 'border-transparent text-[#7B9586] group-hover:text-[#B2C8BA] group-hover:bg-[#0D2D22]/60 group-active:scale-95 group-active:bg-[#0D2D22]'
      }`}
    >
      <Icon
        className={`h-5 w-5 mb-1 transition-all duration-200 ${
          isActive
            ? 'text-[#A6F16A] scale-105'
            : 'text-[#7B9586] group-hover:text-[#B2C8BA]'
        }`}
        strokeWidth={isActive ? 2.25 : 1.75}
        aria-hidden="true"
      />
      <span
        className={`truncate text-[10.5px] tracking-normal leading-none transition-colors ${
          isActive
            ? 'font-bold text-[#A6F16A]'
            : 'font-medium text-[#7B9586] group-hover:text-[#B2C8BA]'
        }`}
      >
        {label}
      </span>
    </div>
  )

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1C4D3C]/80 bg-[#08221A]/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.35)] pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Bottom Navigation"
    >
      <div className="mx-auto flex h-16 w-full max-w-md sm:max-w-lg items-center justify-around px-2 sm:px-4">
        {items.map((item) => {
          const active = isItemActive(item)

          if (item.type === 'link') {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="group flex flex-1 h-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A6F16A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08221A] rounded-2xl cursor-pointer"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                title={item.title || item.label}
              >
                {renderItemContent(item.icon, item.label, active)}
              </NavLink>
            )
          }

          return (
            <button
              key="menu-toggle"
              type="button"
              onClick={item.onClick}
              className="group flex flex-1 h-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A6F16A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08221A] rounded-2xl cursor-pointer"
              aria-label={item.ariaLabel}
              aria-expanded={item.isActive}
            >
              {renderItemContent(item.icon, item.label, active)}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
