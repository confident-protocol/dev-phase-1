import { motion } from "framer-motion";

/** Full-bleed product illustration: private payroll routing across chains. */
export default function HeroIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero)" }} />

      <svg className="absolute inset-0 h-full w-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cp-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="oklch(0.45 0.04 200 / 0.18)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cp-grid)" />
      </svg>

      <motion.svg
        viewBox="0 0 960 640"
        className="absolute inset-x-0 bottom-[-8%] mx-auto h-[78%] w-[min(1100px,120%)] animate-float md:bottom-[-4%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <defs>
          <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.99 0.01 220)" />
            <stop offset="100%" stopColor="oklch(0.94 0.03 200)" />
          </linearGradient>
          <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.34 0.07 195)" />
            <stop offset="100%" stopColor="oklch(0.48 0.1 165)" />
          </linearGradient>
          <linearGradient id="citron" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.9 0.19 120)" />
            <stop offset="100%" stopColor="oklch(0.82 0.14 150)" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="oklch(0.35 0.04 210 / 0.18)" />
          </filter>
        </defs>

        <g filter="url(#soft)">
          <rect x="70" y="190" width="220" height="260" rx="28" fill="url(#panel)" stroke="oklch(0.8 0.02 220)" />
          <rect x="98" y="228" width="164" height="18" rx="9" fill="url(#ink)" opacity="0.9" />
          <rect x="98" y="266" width="120" height="12" rx="6" fill="oklch(0.82 0.02 220)" />
          <rect x="98" y="296" width="164" height="72" rx="16" fill="oklch(0.96 0.02 200)" stroke="oklch(0.86 0.02 220)" />
          <circle cx="130" cy="332" r="14" fill="url(#citron)" />
          <rect x="156" y="322" width="84" height="10" rx="5" fill="oklch(0.35 0.05 195)" />
          <rect x="156" y="340" width="56" height="8" rx="4" fill="oklch(0.75 0.02 220)" />
          <text x="98" y="410" fill="oklch(0.42 0.03 210)" fontFamily="Manrope, sans-serif" fontSize="14">
            Treasury vault
          </text>
        </g>

        <g filter="url(#soft)">
          <rect x="360" y="150" width="240" height="340" rx="32" fill="url(#panel)" stroke="oklch(0.8 0.02 220)" />
          <circle cx="480" cy="270" r="70" fill="oklch(0.95 0.04 170)" stroke="url(#ink)" strokeWidth="3" />
          <path
            d="M445 270c0-18 16-33 35-33s35 15 35 33-16 33-35 33-35-15-35-33Z"
            fill="none"
            stroke="url(#citron)"
            strokeWidth="4"
            className="animate-route-flow"
          />
          <path d="M480 245v50M455 270h50" stroke="oklch(0.35 0.07 195)" strokeWidth="3" strokeLinecap="round" />
          <rect x="404" y="370" width="152" height="14" rx="7" fill="oklch(0.88 0.03 200)" />
          <rect x="424" y="398" width="112" height="10" rx="5" fill="oklch(0.9 0.08 130)" />
          <text x="404" y="450" fill="oklch(0.42 0.03 210)" fontFamily="Manrope, sans-serif" fontSize="14">
            ZK + FHE privacy layer
          </text>
        </g>

        <g filter="url(#soft)">
          <rect x="670" y="190" width="220" height="260" rx="28" fill="url(#panel)" stroke="oklch(0.8 0.02 220)" />
          <rect x="698" y="228" width="164" height="18" rx="9" fill="url(#ink)" opacity="0.85" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x="698"
                y={268 + i * 48}
                width="164"
                height="36"
                rx="12"
                fill="oklch(0.97 0.015 200)"
                stroke="oklch(0.88 0.02 220)"
              />
              <circle cx="720" cy={286 + i * 48} r="8" fill={i === 1 ? "url(#citron)" : "oklch(0.7 0.05 195)"} />
              <rect x="738" y={280 + i * 48} width="96" height="8" rx="4" fill="oklch(0.78 0.02 220)" />
            </g>
          ))}
          <text x="698" y="430" fill="oklch(0.42 0.03 210)" fontFamily="Manrope, sans-serif" fontSize="14">
            Private employee payouts
          </text>
        </g>

        <path
          d="M290 300 C330 300, 330 250, 360 250"
          stroke="url(#ink)"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-route-flow"
        />
        <path
          d="M600 320 C640 320, 640 300, 670 300"
          stroke="url(#citron)"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-route-flow"
        />

        {[
          { x: 180, y: 120, label: "ETH" },
          { x: 480, y: 88, label: "BASE" },
          { x: 780, y: 120, label: "SOL" },
        ].map((node, i) => (
          <g key={node.label}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="22"
              fill="oklch(1 0 0 / 0.9)"
              stroke="oklch(0.45 0.07 195)"
              strokeWidth="2"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fill="oklch(0.32 0.05 195)"
              fontFamily="Syne, sans-serif"
              fontSize="11"
              fontWeight="700"
            >
              {node.label}
            </text>
          </g>
        ))}
      </motion.svg>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
