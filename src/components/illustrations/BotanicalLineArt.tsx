interface BotanicalLineArtProps {
  className?: string
  opacity?: number
  color?: string
}

export default function BotanicalLineArt({
  className = "w-32 h-32",
  opacity = 0.25,
  color = "currentColor",
}: BotanicalLineArtProps) {
  return (
    <svg
      viewBox="0 0 160 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Delicate organic stem */}
      <path
        d="M 80 195 C 75 140, 85 90, 70 15"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Leaf 1 - Top right */}
      <path
        d="M 72 35 C 95 25, 115 40, 105 60 C 90 62, 75 50, 74 38"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 74 38 C 88 44, 98 48, 105 60" stroke={color} strokeWidth="0.8" opacity="0.6" />

      {/* Leaf 2 - Upper left */}
      <path
        d="M 77 65 C 50 55, 30 72, 42 92 C 58 92, 72 80, 76 68"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 76 68 C 62 76, 50 82, 42 92" stroke={color} strokeWidth="0.8" opacity="0.6" />

      {/* Leaf 3 - Mid right */}
      <path
        d="M 80 100 C 105 90, 125 105, 115 128 C 98 128, 85 116, 81 104"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 81 104 C 95 110, 107 117, 115 128" stroke={color} strokeWidth="0.8" opacity="0.6" />

      {/* Leaf 4 - Lower left */}
      <path
        d="M 82 135 C 55 125, 35 142, 48 165 C 65 162, 78 150, 81 138"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 81 138 C 68 146, 56 153, 48 165" stroke={color} strokeWidth="0.8" opacity="0.6" />

      {/* Small bud at top */}
      <circle cx="70" cy="15" r="2" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  )
}
