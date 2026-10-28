export interface BrandNameProps {
  /**
   * Font size, weight, or extra styling classes.
   */
  className?: string
  /**
   * Capitalization format:
   * - 'title': "B-Liffe" (default)
   * - 'lowercase': "b-liffe"
   * - 'uppercase': "B-LIFFE"
   */
  casing?: 'title' | 'lowercase' | 'uppercase'
  /**
   * Color X (Primary accent color).
   * Applied to: 'B', '-', and 'e' (ensuring B and e are the exact same color).
   * Defaults to 'text-[#A6F16A]' (vivid lime).
   */
  colorX?: string
  /**
   * Color Y (Secondary accent color).
   * Applied to the inner word: 'L', 'i', 'f', 'f'.
   * Defaults to 'text-[#20D6A0]' (vibrant turquoise).
   */
  colorY?: string
}

/**
 * Standardized Letter-by-Letter B-Liffe Brand Name Component
 *
 * Implements the color mapping pattern where:
 * - 'B' and 'e' share the exact same color (Color X, default lime #A6F16A)
 * - '-' shares Color X with B
 * - 'L', 'i', 'f', 'f' all share Color Y (default turquoise #20D6A0)
 */
export default function BrandName({
  className = '',
  casing = 'title',
  colorX = 'text-[#A6F16A]',
  colorY = 'text-[#20D6A0]',
}: BrandNameProps) {
  let letterB = 'B'
  let letterL = 'L'
  let letterI = 'i'
  let letterF1 = 'f'
  let letterF2 = 'f'
  let letterE = 'e'

  if (casing === 'lowercase') {
    letterB = 'b'
    letterL = 'l'
    letterI = 'i'
    letterF1 = 'f'
    letterF2 = 'f'
    letterE = 'e'
  } else if (casing === 'uppercase') {
    letterB = 'B'
    letterL = 'L'
    letterI = 'I'
    letterF1 = 'F'
    letterF2 = 'F'
    letterE = 'E'
  }

  return (
    <span
      className={`inline-flex items-baseline font-sans font-extrabold tracking-normal leading-none select-none ${className}`}
      aria-label="B-Liffe"
    >
      {/* 'B' and 'e' use the exact same Color X */}
      <span className={colorX}>{letterB}</span>
      <span className={colorX}>-</span>
      {/* Inner 'Liff' letters use Color Y */}
      <span className={colorY}>{letterL}</span>
      <span className={colorY}>{letterI}</span>
      <span className={colorY}>{letterF1}</span>
      <span className={colorY}>{letterF2}</span>
      {/* 'e' matches 'B' in Color X */}
      <span className={colorX}>{letterE}</span>
    </span>
  )
}
