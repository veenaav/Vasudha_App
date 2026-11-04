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
   * Color theme variant:
   * - 'dark': Light/mint text for dark forest backgrounds (default)
   * - 'light': Deep forest green text for light/pastel sage backgrounds
   * - 'white': Pure white logo emblem and pure white text for solid dark green headers
   */
  variant?: 'dark' | 'light' | 'white'
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
  /**
   * Optional explicit logo image source override
   */
  logoSrc?: string
  /**
   * Optional wordmark class override (e.g. text color or custom shadow)
   */
  wordmarkClassName?: string
}

export default function BrandLockup({
  layout = 'vertical',
  size = 'md',
  variant = 'dark',
  className = '',
  subtitle,
  subtitleClassName = '',
  logoSrc: customLogoSrc,
  wordmarkClassName,
}: BrandLockupProps) {
  const isLight = variant === 'light'
  const isWhite = variant === 'white'

  const defaultLogo = isWhite
    ? 'splash-logo-opt1.png'
    : isLight
      ? 'splash-logo-forest.png'
      : 'splash-logo-opt2.png'

  const logoSrc = customLogoSrc || `${import.meta.env.BASE_URL}${defaultLogo}`

  const wordmarkColor = isWhite
    ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
    : isLight
      ? 'text-[#08221A] drop-shadow-[0_1px_1px_rgba(8,34,26,0.15)]'
      : 'text-[#E4F6EC] drop-shadow-[0_0_12px_rgba(32,214,160,0.22)]'

  const defaultSubtitleColor = isWhite
    ? 'text-[#B2C8BA]'
    : isLight
      ? 'text-[#1C4D3C]'
      : 'text-[#B2C8BA]'

  const horizontalIconShadow = isWhite
    ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
    : isLight
      ? 'drop-shadow-[0_1px_2px_rgba(8,34,26,0.2)]'
      : 'drop-shadow-[0_0_10px_rgba(32,214,160,0.25)]'

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
          className={`${iconSizes[size]} object-contain shrink-0 filter ${horizontalIconShadow}`}
        />
        <div className="flex flex-col justify-center min-w-0">
          <span
            className={`${textSizes[size]} font-sans font-extrabold tracking-[0.14em] uppercase ${wordmarkClassName || wordmarkColor} leading-none`}
          >
            B-LIFFE
          </span>
          {subtitle && (
            <p
              className={`text-xs ${defaultSubtitleColor} font-normal leading-tight mt-1 truncate ${subtitleClassName}`}
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
          className={`${iconSizes[size]} object-contain select-none filter ${
            isWhite
              ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]'
              : isLight
                ? 'drop-shadow-[0_2px_8px_rgba(8,34,26,0.3)]'
                : 'drop-shadow-[0_0_16px_rgba(32,214,160,0.25)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]'
          }`}
        />
      </div>
      <div className={margins[size]}>
        <span
          className={`${textSizes[size]} font-sans font-extrabold tracking-[0.14em] uppercase ${wordmarkClassName || wordmarkColor}`}
        >
          B-LIFFE
        </span>
      </div>
      {subtitle && (
        <p className={`mt-1 text-xs ${defaultSubtitleColor} font-normal leading-tight ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
