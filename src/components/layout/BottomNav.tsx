import { NavLink } from 'react-router-dom'
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

  const renderItemContent = (Icon: LucideIcon, label: string, isActive: boolean) => (
    <div
      className={`flex flex-col items-center justify-center px-3.5 py-1 rounded-2xl transition-all ${
        isActive
          ? 'bg-[#133D2F] text-[#A6F16A] border border-[#1C4D3C] shadow-sm'
          : 'text-[#7B9586] group-active:scale-95 group-active:bg-[#0D2D22]'
      }`}
    >
      <Icon
        className={`h-4.5 w-4.5 mb-0.5 transition-colors ${
          isActive ? 'text-[#A6F16A]' : 'text-[#7B9586]'
        }`}
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className="truncate text-[10px] tracking-normal font-semibold">{label}</span>
    </div>
  )

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[#1C4D3C] bg-[#08221A]/95 backdrop-blur-lg px-2 sm:px-6 pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom Navigation"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        {items.map((item) => {
          if (item.type === 'link') {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/home'}
                className={({ isActive }) =>
                  `group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none ${
                    isActive ? 'text-[#A6F16A]' : 'text-[#7B9586] hover:text-[#B2C8BA]'
                  }`
                }
                aria-label={item.label}
                title={item.title || item.label}
              >
                {({ isActive }) => renderItemContent(item.icon, item.label, isActive)}
              </NavLink>
            )
          }

          return (
            <button
              key="menu-toggle"
              type="button"
              onClick={item.onClick}
              className={`group flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 transition-all focus:outline-none cursor-pointer ${
                item.isActive ? 'text-[#A6F16A]' : 'text-[#7B9586] hover:text-[#B2C8BA]'
              }`}
              aria-label={item.ariaLabel}
              aria-expanded={item.isActive}
            >
              {renderItemContent(item.icon, item.label, item.isActive)}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
