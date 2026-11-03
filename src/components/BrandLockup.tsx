export interface BrandLockupProps {
  /**
   * Layout orientation:
   * - 'vertical': Centered emblem directly above wordmark (Splash, Login, Create Account, Welcome hero)
   * - 'horizontal': Inline emblem beside wordmark (TopBar, NavigationDrawer, headers)
   */
  layout?: 'vertical' | 'horizontal'
  /**
   * Size presets:
   * - 'sm': Compact headers (TopBar, NavigationDrawer)
   * - 'md': Auth pages & cards (Login, Create Account, Welcome)
   * - 'lg': Full splash screen hero
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Optional custom container classes
   */
  className?: string
  /**
   * Optional subtitle line (rendered under the wordmark)
   */
  subtitle?: string
  /**
   * Optional subtitle class override
   */
  subtitleClassName?: string
}

export default function BrandLockup({
  layout = 'vertical',
  size = 'md',
  className = '',
  subtitle,
  subtitleClassName = '',
}: BrandLockupProps) {
  const logoSrc = `${import.meta.env.BASE_URL}splash-logo-opt2.png`

  if (layout === 'horizontal') {
    const iconSizes = {
      sm: 'w-8 h-8 sm:w-9 sm:h-9',
      md: 'w-10 h-10 sm:w-11 sm:h-11',
      lg: 'w-14 h-14 sm:w-16 sm:h-16',
    }
    const textSizes = {
      sm: 'text-base sm:text-lg',
      md: 'text-lg sm:text-xl',
      lg: 'text-2xl sm:text-3xl',
    }
    const gaps = {
      sm: 'gap-2 sm:gap-2.5',
      md: 'gap-2.5 sm:gap-3',
      lg: 'gap-3.5 sm:gap-4',
    }

    return (
      <div className={`flex items-center ${gaps[size]} select-none ${className}`}>
        <img
          src={logoSrc}
          alt="B-LIFFE Logo"
          className={`${iconSizes[size]} object-contain shrink-0 filter drop-shadow-[0_0_10px_rgba(32,214,160,0.25)]`}
        />
        <div className="flex flex-col justify-center min-w-0">
          <span
            className={`${textSizes[size]} font-sans font-extrabold tracking-[0.14em] uppercase text-[#E4F6EC] drop-shadow-[0_0_12px_rgba(32,214,160,0.22)] leading-none`}
          >
            B-LIFFE
          </span>
          {subtitle && (
            <p
              className={`text-xs text-[#B2C8BA] font-normal leading-tight mt-1 truncate ${subtitleClassName}`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Vertical (Stacked) Lockup with tight gap
  const iconSizes = {
    sm: 'w-10 h-9.5 sm:w-11 sm:h-10.5',
    md: 'w-14 h-13 sm:w-16 sm:h-15',
    lg: 'w-[145px] h-[138px] sm:w-[175px] sm:h-[166px] md:w-[190px] md:h-[180px]',
  }
  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-[24px] sm:text-[28px] md:text-[30px]',
  }
  const margins = {
    sm: 'mt-0.5',
    md: 'mt-1',
    lg: 'mt-1 sm:mt-1.5',
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      <div className="flex items-center justify-center">
        <img
          src={logoSrc}
          alt="B-LIFFE Logo"
          className={`${iconSizes[size]} object-contain select-none filter drop-shadow-[0_0_16px_rgba(32,214,160,0.25)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]`}
        />
      </div>
      <div className={margins[size]}>
        <span
          className={`${textSizes[size]} font-sans font-extrabold tracking-[0.14em] uppercase text-[#E4F6EC] drop-shadow-[0_0_12px_rgba(32,214,160,0.22)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]`}
        >
          B-LIFFE
        </span>
      </div>
      {subtitle && (
        <p className={`mt-1 text-xs text-[#B2C8BA] font-normal leading-tight ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

