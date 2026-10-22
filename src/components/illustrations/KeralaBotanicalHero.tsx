export default function KeralaBotanicalHero() {
  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-[#DCE8D9] bg-gradient-to-b from-[#FAF7F0] to-[#EBF2E9]/60 shadow-2xs">
      <svg
        viewBox="0 0 360 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[115px] w-full object-contain"
        aria-label="Botanical illustration of Kerala flora and butterfly"
      >
        <defs>
          {/* Subtle nature gradients */}
          <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1B382A" />
            <stop offset="60%" stopColor="#244B38" />
            <stop offset="100%" stopColor="#3B6E52" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#52856A" />
            <stop offset="100%" stopColor="#244B38" />
          </linearGradient>
          <linearGradient id="leafSage" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C2D6BE" />
            <stop offset="100%" stopColor="#DCE8D9" />
          </linearGradient>
          <linearGradient id="butterflyWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#244B38" />
            <stop offset="40%" stopColor="#2E694D" />
            <stop offset="80%" stopColor="#8AB89E" />
            <stop offset="100%" stopColor="#C2D6BE" />
          </linearGradient>
          <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7F0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#DCE8D9" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Soft background aura */}
        <circle cx="180" cy="70" r="62" fill="url(#sunGlow)" />
        <circle cx="280" cy="45" r="38" fill="#EBF2E9" fillOpacity="0.6" />

        {/* Left Side: Kerala Banana / Monstera broad leaf */}
        <g opacity="0.95">
          {/* Stem */}
          <path
            d="M 20 135 C 50 110 80 85 110 65"
            stroke="#244B38"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Leaf Body */}
          <path
            d="M 110 65 C 85 45 45 50 25 75 C 10 95 20 120 45 125 C 75 125 95 95 110 65 Z"
            fill="url(#leafGrad1)"
          />
          {/* Leaf veins */}
          <path d="M 45 105 C 60 95 80 85 95 75" stroke="#8AB89E" strokeWidth="1.2" opacity="0.7" />
          <path d="M 35 88 C 55 82 75 75 90 70" stroke="#8AB89E" strokeWidth="1.2" opacity="0.7" />
          <path d="M 55 115 C 70 108 85 98 100 85" stroke="#8AB89E" strokeWidth="1.2" opacity="0.7" />
        </g>

        {/* Center-Left: Tropical Fern / Palm Frond */}
        <g opacity="0.9">
          <path
            d="M 60 130 C 95 90 130 50 170 30"
            stroke="#1B382A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Leaflets */}
          <path d="M 85 105 C 72 98 68 85 75 80 C 82 85 95 95 95 100 Z" fill="url(#leafGrad2)" />
          <path d="M 98 94 C 112 88 120 78 116 72 C 106 75 98 85 98 94 Z" fill="url(#leafGrad1)" />
          <path d="M 112 80 C 100 70 95 58 102 52 C 110 58 120 68 122 74 Z" fill="url(#leafGrad2)" />
          <path d="M 128 66 C 142 58 148 46 142 42 C 134 45 126 56 128 66 Z" fill="url(#leafGrad1)" />
          <path d="M 144 50 C 132 40 128 28 135 24 C 142 28 150 38 152 44 Z" fill="url(#leafGrad2)" />
          <path d="M 160 38 C 172 30 175 18 168 16 C 162 20 156 28 160 38 Z" fill="url(#leafGrad1)" />
        </g>

        {/* Delicate pale sage background branch */}
        <g opacity="0.7">
          <path
            d="M 230 135 C 210 100 195 70 175 45"
            stroke="#C2D6BE"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse cx="190" cy="58" rx="14" ry="7" transform="rotate(-35 190 58)" fill="url(#leafSage)" />
          <ellipse cx="210" cy="80" rx="15" ry="7.5" transform="rotate(-40 210 80)" fill="url(#leafSage)" />
          <ellipse cx="178" cy="42" rx="12" ry="6" transform="rotate(-30 178 42)" fill="url(#leafSage)" />
        </g>

        {/* Right Side: Graceful Flowering Branch (Cassia / Kanikkonna bud vibe) */}
        <g>
          <path
            d="M 270 135 C 265 95 250 65 220 40"
            stroke="#244B38"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path d="M 235 60 C 255 52 270 58 275 68 C 265 74 245 72 235 60 Z" fill="url(#leafGrad1)" />
          <path d="M 248 85 C 270 78 285 86 290 95 C 278 100 258 96 248 85 Z" fill="url(#leafGrad2)" />
          <path d="M 225 45 C 238 32 252 35 255 42 C 248 48 234 49 225 45 Z" fill="url(#leafGrad1)" />
          {/* Small gentle buds */}
          <circle cx="218" cy="38" r="4.5" fill="#E8C547" />
          <circle cx="218" cy="38" r="2.5" fill="#FAF7F0" />
          <circle cx="228" cy="28" r="3.5" fill="#E8C547" />
          <circle cx="240" cy="22" r="3" fill="#8AB89E" />
        </g>

        {/* Center Feature: Kerala Butterfly (Malabar Banded Peacock aesthetic) */}
        <g transform="translate(182, 38) rotate(-8)">
          {/* Left Forewing */}
          <path
            d="M 0 0 C -15 -18 -32 -22 -40 -12 C -46 -2 -34 14 -12 10 Z"
            fill="url(#butterflyWing)"
          />
          {/* Left Hindwing */}
          <path
            d="M -5 6 C -18 12 -26 26 -20 32 C -12 36 -2 24 2 12 Z"
            fill="url(#leafGrad1)"
          />
          {/* Left Wing Emerald Band Accent */}
          <path
            d="M -10 -4 C -22 -8 -28 -4 -25 4 C -18 2 -12 1 -10 -4 Z"
            fill="#8AB89E"
            opacity="0.9"
          />
          <circle cx="-18" cy="24" r="2" fill="#E8C547" opacity="0.85" />

          {/* Right Forewing */}
          <path
            d="M 4 -1 C 18 -20 36 -22 43 -11 C 48 -1 35 15 14 10 Z"
            fill="url(#butterflyWing)"
          />
          {/* Right Hindwing */}
          <path
            d="M 8 6 C 20 13 28 27 22 33 C 14 36 4 24 1 12 Z"
            fill="url(#leafGrad1)"
          />
          {/* Right Wing Emerald Band Accent */}
          <path
            d="M 12 -4 C 24 -8 30 -4 26 4 C 20 2 14 1 12 -4 Z"
            fill="#8AB89E"
            opacity="0.9"
          />
          <circle cx="19" cy="24" r="2" fill="#E8C547" opacity="0.85" />

          {/* Butterfly Body */}
          <ellipse cx="1" cy="7" rx="2.2" ry="11" fill="#1B382A" />
          <circle cx="1" cy="-4" r="2.5" fill="#1B382A" />
          {/* Antennae */}
          <path d="M 0 -6 C -3 -14 -8 -16 -11 -15" stroke="#1B382A" strokeWidth="1" strokeLinecap="round" />
          <path d="M 2 -6 C 5 -14 10 -16 13 -15" stroke="#1B382A" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}
