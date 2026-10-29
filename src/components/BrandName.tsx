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
   * Primary brand color (Natural Green).
   * Applied to: 'B', '-', 'L', 'i', the second 'f', and 'e'.
   * Visually highlights "Life" (L + i + second f + e) in natural green.
   * Defaults to 'text-[#A6F16A]' (vivid lime/natural green).
   */
  colorX?: string
  /**
   * Complementary accent color.
   * Applied to: the first 'f' (immediately following 'Li').
   * Defaults to 'text-[#20D6A0]' (vibrant turquoise).
   */
  colorY?: string
}

/**
 * Standardized Letter-by-Letter B-Liffe Brand Name Component
 *
 * Implements the color mapping pattern where:
 * - 'B', '-', 'L', 'i', the second 'f', and 'e' share Color X (natural green, default #A6F16A)
 * - The first 'f' is styled in Color Y (complementary turquoise, default #20D6A0)
 *
 * This visually highlights "Life" (L + i + second f + e) in natural green,
 * while retaining the exact spelling "B-Liffe".
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
      {/* 'B' and '-' in natural green */}
      <span className={colorX}>{letterB}</span>
      <span className={colorX}>-</span>
      {/* 'L' and 'i' in the same natural green as B */}
      <span className={colorX}>{letterL}</span>
      <span className={colorX}>{letterI}</span>
      {/* First 'f' in complementary accent color */}
      <span className={colorY}>{letterF1}</span>
      {/* Second 'f' and 'e' in natural green, completing "Life" */}
      <span className={colorX}>{letterF2}</span>
      <span className={colorX}>{letterE}</span>
    </span>
  )
}
