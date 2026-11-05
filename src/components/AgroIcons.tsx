import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 1. AYAM SEGAR MADANI (Fresh Whole Dressed Halal Poultry with Fresh Rosemary Herb)
export const ChickenProduceIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="chickenGrad" x1="8" y1="12" x2="40" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="0.5" stopColor="#d97706" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="herbGrad" x1="30" y1="6" x2="42" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="badgeGrad" x1="4" y1="4" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Soft plate shadow */}
    <ellipse cx="24" cy="41" rx="18" ry="4" fill="#0f172a" fillOpacity="0.12" />
    
    {/* Dressed Chicken Body */}
    <path
      d="M12 28C10 23 12 18 16 15C19 13 24 13 28 15C32 17 36 21 37 26C38 31 35 36 30 38C25 40 18 39 14 36C12.5 34.5 12 31.5 12 28Z"
      fill="url(#chickenGrad)"
      stroke="#78350f"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Breast Highlight */}
    <path
      d="M16 23C16 19 21 16 26 17C29 18 32 21 32 25C32 28 29 32 25 33C21 34 16 30 16 23Z"
      fill="#fef3c7"
      fillOpacity="0.45"
    />
    {/* Drumstick Right */}
    <path
      d="M33 24C36 23 40 25 41 29C42 32 40 35 37 36C35 37 33 36 32 34"
      stroke="#78350f"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="41.5" cy="29.5" r="2" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" />
    {/* Wing fold */}
    <path
      d="M18 22C16 24 15 28 17 31C19 33 22 33 24 31"
      stroke="#78350f"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Fresh Farm Herb / Rosemary Sprig */}
    <path
      d="M26 14C30 10 36 8 41 7M33 11C34 8 37 7 38 7M36 10C38 8 40 8 41 9M31 12C32 14 34 14 35 14"
      stroke="url(#herbGrad)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Halal / Fresh Quality Agro Stamp Badge */}
    <circle cx="10" cy="12" r="7" fill="url(#badgeGrad)" stroke="#ffffff" strokeWidth="1.5" />
    <path
      d="M7.5 12L9.5 14L13 9.5"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 2. SEPAPAN TELUR AYAM GRED A (30-Egg Tray / Crate with Radiant Fresh Yolk)
export const EggCrateIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="trayGrad" x1="4" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a1a1aa" />
        <stop offset="0.5" stopColor="#71717a" />
        <stop offset="1" stopColor="#52525b" />
      </linearGradient>
      <linearGradient id="eggGrad1" x1="12" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffedd5" />
        <stop offset="0.6" stopColor="#fed7aa" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
      <linearGradient id="eggGrad2" x1="24" y1="6" x2="36" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff7ed" />
        <stop offset="0.7" stopColor="#ffedd5" />
        <stop offset="1" stopColor="#fb923c" />
      </linearGradient>
      <linearGradient id="yolkGrad" x1="20" y1="20" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="1" stopColor="#eab308" />
      </linearGradient>
    </defs>
    {/* Base shadow */}
    <ellipse cx="24" cy="43" rx="19" ry="3.5" fill="#0f172a" fillOpacity="0.12" />
    
    {/* Moulded Pulp 30-Egg Tray Isometric Base */}
    <path
      d="M6 28L24 38L42 28L38 23L24 16L10 23L6 28Z"
      fill="url(#trayGrad)"
      stroke="#3f3f46"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Tray Pockets Grid Dimples */}
    <path d="M12 25L24 32L36 25" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M18 21L24 25L30 21" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />

    {/* Egg Left */}
    <ellipse
      cx="14"
      cy="19"
      rx="5.5"
      ry="7.5"
      fill="url(#eggGrad1)"
      stroke="#c2410c"
      strokeWidth="1.4"
      transform="rotate(-8 14 19)"
    />
    {/* Egg Right */}
    <ellipse
      cx="34"
      cy="19"
      rx="5.5"
      ry="7.5"
      fill="url(#eggGrad1)"
      stroke="#c2410c"
      strokeWidth="1.4"
      transform="rotate(8 34 19)"
    />
    {/* Center Top Big Egg (Gred A Hero) */}
    <ellipse
      cx="24"
      cy="15"
      rx="7"
      ry="9.5"
      fill="url(#eggGrad2)"
      stroke="#c2410c"
      strokeWidth="1.6"
    />
    {/* Egg shell sheen */}
    <path
      d="M21 11C21 8.5 23 7 24.5 7"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* Official Gred A Gold Ribbon Stamp */}
    <rect x="15" y="32" width="18" height="8" rx="4" fill="#047857" stroke="#ffffff" strokeWidth="1.2" />
    <text
      x="24"
      y="38"
      textAnchor="middle"
      fill="#ffffff"
      fontSize="5.5"
      fontWeight="900"
      fontFamily="monospace"
    >
      GRED A
    </text>
  </svg>
);

// 3. BUAH TEMPATAN (Malaysian MD2 Honey Pineapple & Juicy Watermelon Slice)
export const PineappleMelonIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="pineBody" x1="10" y1="16" x2="28" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="0.6" stopColor="#eab308" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="pineCrown" x1="12" y1="4" x2="26" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4ade80" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
      <linearGradient id="melonFlesh" x1="24" y1="24" x2="44" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f87171" />
        <stop offset="0.7" stopColor="#dc2626" />
        <stop offset="1" stopColor="#991b1b" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="25" cy="43" rx="18" ry="3.5" fill="#0f172a" fillOpacity="0.12" />

    {/* Pineapple Crown Leaves */}
    <path
      d="M19 16C16 11 11 7 8 6C11 10 13 14 15 17"
      fill="url(#pineCrown)"
      stroke="#14532d"
      strokeWidth="1.3"
    />
    <path
      d="M19 15C19 9 18 4 19 2C21 5 22 10 21 15"
      fill="url(#pineCrown)"
      stroke="#14532d"
      strokeWidth="1.3"
    />
    <path
      d="M20 16C23 11 27 7 30 6C27 10 25 14 23 17"
      fill="url(#pineCrown)"
      stroke="#14532d"
      strokeWidth="1.3"
    />

    {/* MD2 Pineapple Oval Body */}
    <ellipse
      cx="19"
      cy="29"
      rx="10"
      ry="13"
      fill="url(#pineBody)"
      stroke="#854d0e"
      strokeWidth="1.8"
    />
    {/* Diamond Lattice Eyes Texture */}
    <path
      d="M13 23L25 35M11 28L23 40M13 35L25 23M11 30L23 18"
      stroke="#854d0e"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Diamond center dots */}
    <circle cx="19" cy="29" r="1.2" fill="#713f12" />
    <circle cx="15" cy="27" r="1" fill="#713f12" />
    <circle cx="23" cy="27" r="1" fill="#713f12" />
    <circle cx="19" cy="35" r="1" fill="#713f12" />

    {/* Crisp Watermelon Wedge (Foreground Right) */}
    <path
      d="M24 38C26 31 31 26 39 25C42 33 39 39 32 41L24 38Z"
      fill="#16a34a"
      stroke="#14532d"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M26 37C27.5 32 31.5 28 38 27C40.5 33 38 38 32 39.5L26 37Z"
      fill="#fecdd3"
    />
    <path
      d="M27.5 36C29 32.5 32 29 37 28.5C39 33 37 36.5 32 38L27.5 36Z"
      fill="url(#melonFlesh)"
    />
    {/* Seeds */}
    <circle cx="31" cy="33" r="0.9" fill="#18181b" />
    <circle cx="34" cy="32" r="0.9" fill="#18181b" />
    <circle cx="33" cy="36" r="0.8" fill="#18181b" />
  </svg>
);

// 4. SAYUR KAMPUNG & CILI KULAI (Organic Malaysian Leafy Greens Bound with Spicy Red Chili)
export const KampungVegIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="leafGrad1" x1="10" y1="4" x2="30" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4ade80" />
        <stop offset="0.6" stopColor="#22c55e" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
      <linearGradient id="leafGrad2" x1="18" y1="6" x2="38" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#86efac" />
        <stop offset="0.7" stopColor="#16a34a" />
        <stop offset="1" stopColor="#166534" />
      </linearGradient>
      <linearGradient id="chiliGrad" x1="22" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ef4444" />
        <stop offset="0.6" stopColor="#dc2626" />
        <stop offset="1" stopColor="#991b1b" />
      </linearGradient>
    </defs>
    {/* Floor shadow */}
    <ellipse cx="24" cy="42" rx="17" ry="3.5" fill="#0f172a" fillOpacity="0.12" />

    {/* Left Sawi / Bayam Leaf */}
    <path
      d="M18 36C12 30 8 20 11 12C14 7 21 8 23 15C25 21 22 30 18 36Z"
      fill="url(#leafGrad1)"
      stroke="#14532d"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M16 12C16.5 20 18 28 18 36" stroke="#bbf7d0" strokeWidth="1.4" strokeLinecap="round" />

    {/* Center High Bayam Leaf */}
    <path
      d="M24 37C19 28 18 16 22 8C25 3 32 4 33 11C34 18 29 29 24 37Z"
      fill="url(#leafGrad2)"
      stroke="#14532d"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M26 8C25.5 17 24.5 26 24 37" stroke="#dcfce7" strokeWidth="1.5" strokeLinecap="round" />

    {/* Right Kangkung Leaf */}
    <path
      d="M26 36C28 29 32 20 37 14C41 10 44 14 42 20C39 26 31 32 26 36Z"
      fill="url(#leafGrad1)"
      stroke="#14532d"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />

    {/* Stems bound bundle */}
    <path d="M19 36L18 43M23 37L23 44M27 36L28 43" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" />
    {/* Natural straw tie */}
    <rect x="17" y="37" width="12" height="4" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />

    {/* Red Malaysian Cili Kulai (Diagonal Foreground Accent) */}
    <path
      d="M37 23C36 21 34 22 33 24C32 28 32 34 35 39C36.5 41 38 43 40 43C41 43 41 40 40 37C39 32 38 27 37 23Z"
      fill="url(#chiliGrad)"
      stroke="#7f1d1d"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Chili Calyx & Curled Stem */}
    <path d="M33 24C32 22 31 20 29 19M34 23L33 21L36 22" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// 5. GUNI BERAS MADANI & TANGKAI PADI EMAS (Traditional Rice Sack with Golden Paddy Sheaves)
export const RicePaddyIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="sackGrad" x1="12" y1="16" x2="36" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fed7aa" />
        <stop offset="0.6" stopColor="#fdba74" />
        <stop offset="1" stopColor="#fb923c" />
      </linearGradient>
      <linearGradient id="paddyGrad" x1="4" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef08a" />
        <stop offset="0.6" stopColor="#eab308" />
        <stop offset="1" stopColor="#a16207" />
      </linearGradient>
    </defs>
    {/* Base shadow */}
    <ellipse cx="25" cy="42" rx="17" ry="3.5" fill="#0f172a" fillOpacity="0.12" />

    {/* Burlap Sack Body */}
    <path
      d="M14 20C12 25 11 34 13 39C14 41 20 42 26 42C32 42 36 41 37 39C39 34 38 25 36 20C34 18 30 19 25 19C20 19 16 18 14 20Z"
      fill="url(#sackGrad)"
      stroke="#9a3412"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Tied top neck with rope */}
    <path
      d="M16 19C15 15 14 13 16 11C18 9 22 10 25 10C28 10 32 9 34 11C36 13 35 15 34 19"
      fill="#ffedd5"
      stroke="#9a3412"
      strokeWidth="1.6"
    />
    <rect x="16" y="17" width="18" height="3" rx="1.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />

    {/* "BERAS 5KG MADANI" Official Label Stencil */}
    <rect x="17" y="25" width="16" height="12" rx="2" fill="#ffffff" fillOpacity="0.85" stroke="#9a3412" strokeWidth="1.2" />
    <text x="25" y="30" textAnchor="middle" fill="#002f6c" fontSize="4.5" fontWeight="900">BERAS</text>
    <text x="25" y="34.5" textAnchor="middle" fill="#15803d" fontSize="3.8" fontWeight="800">MADANI</text>

    {/* Golden Paddy Stalk (Tangkai Padi) */}
    <path d="M10 32C9 24 10 16 15 8" stroke="#ca8a04" strokeWidth="1.6" strokeLinecap="round" />
    <ellipse cx="14" cy="9" rx="2" ry="3.5" fill="url(#paddyGrad)" stroke="#854d0e" strokeWidth="0.8" transform="rotate(25 14 9)" />
    <ellipse cx="11" cy="14" rx="2" ry="3.5" fill="url(#paddyGrad)" stroke="#854d0e" strokeWidth="0.8" transform="rotate(-30 11 14)" />
    <ellipse cx="14" cy="18" rx="2" ry="3.5" fill="url(#paddyGrad)" stroke="#854d0e" strokeWidth="0.8" transform="rotate(25 14 18)" />
    <ellipse cx="10" cy="23" rx="2" ry="3.5" fill="url(#paddyGrad)" stroke="#854d0e" strokeWidth="0.8" transform="rotate(-30 10 23)" />
  </svg>
);

// 6. IKAN & MAKANAN LAUT SEGAR (Fresh Catch Mackerel with Marine Water Waves)
export const FreshFishIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="fishGrad" x1="6" y1="14" x2="42" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#67e8f9" />
        <stop offset="0.5" stopColor="#0284c7" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    <ellipse cx="24" cy="42" rx="18" ry="3" fill="#0f172a" fillOpacity="0.12" />

    {/* Fish Body Streamline */}
    <path
      d="M6 24C10 17 22 15 34 20L42 14L40 24L42 34L34 28C22 33 10 31 6 24Z"
      fill="url(#fishGrad)"
      stroke="#0c4a6e"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Silver Belly */}
    <path
      d="M10 26C15 31 25 31 33 27C25 28 17 28 10 26Z"
      fill="#f0f9ff"
      fillOpacity="0.75"
    />
    {/* Gills & Eye */}
    <circle cx="13" cy="22" r="2.2" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.2" />
    <circle cx="13.5" cy="22" r="1.1" fill="#082f49" />
    <path d="M19 19C17 22 17 26 19 29" stroke="#0c4a6e" strokeWidth="1.6" strokeLinecap="round" />
    {/* Fin */}
    <path d="M22 24C25 24 28 26 27 28C24 28 22 26 22 24Z" fill="#bae6fd" stroke="#0c4a6e" strokeWidth="1.2" />
    {/* Marine wave bubbles */}
    <circle cx="4" cy="18" r="1.5" fill="#38bdf8" fillOpacity="0.6" />
    <circle cx="7" cy="13" r="1" fill="#38bdf8" fillOpacity="0.6" />
  </svg>
);

// 7. GERAI PASAR TANI JAM (Authentic Malaysian Agro Canopy Tent & Wooden Stand)
export const PasarStallIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <ellipse cx="24" cy="43" rx="19" ry="3" fill="#0f172a" fillOpacity="0.12" />

    {/* Canopy Roof Strips (Green & White MADANI Theme) */}
    <path d="M4 18L10 6L38 6L44 18L4 18Z" fill="#15803d" stroke="#14532d" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M11 6L9 18L16 18L17 6H11Z" fill="#ffffff" />
    <path d="M25 6L23 18L30 18L31 6H25Z" fill="#ffffff" />
    {/* Scalloped valance */}
    <path d="M4 18Q7 22 10 18Q13 22 16 18Q19 22 22 18Q25 22 28 18Q31 22 34 18Q37 22 40 18Q42 22 44 18" fill="#166534" stroke="#14532d" strokeWidth="1.4" />

    {/* Poles */}
    <line x1="8" y1="21" x2="8" y2="40" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="21" x2="40" y2="40" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />

    {/* Wooden Counter Display */}
    <rect x="7" y="28" width="34" height="12" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.6" />
    <line x1="7" y1="34" x2="41" y2="34" stroke="#78350f" strokeWidth="1.2" />

    {/* Crates with Produce Motif on Counter */}
    <rect x="11" y="25" width="8" height="5" rx="1" fill="#15803d" stroke="#14532d" strokeWidth="1" />
    <circle cx="15" cy="24" r="2" fill="#ef4444" />
    <rect x="29" y="25" width="8" height="5" rx="1" fill="#eab308" stroke="#854d0e" strokeWidth="1" />
    <circle cx="33" cy="24" r="2" fill="#f97316" />
  </svg>
);

// 8. KUOTA SUBSIDI FIRST-COME FIRST-SERVED (Ticket Allocation & Remaining Meter)
export const QuotaMeterIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="ticketGrad" x1="6" y1="10" x2="42" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <ellipse cx="24" cy="42" rx="16" ry="3" fill="#0f172a" fillOpacity="0.12" />

    {/* Ticket with Notched Corners */}
    <path
      d="M6 14C8 14 10 12 10 10V8H38V10C38 12 40 14 42 14V34C40 34 38 36 38 38V40H10V38C10 36 8 34 6 34V14Z"
      fill="url(#ticketGrad)"
      stroke="#1e3a8a"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Perforated divider line */}
    <line x1="28" y1="10" x2="28" y2="38" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="2 2" />

    {/* Left Info: User icon & Subsidy RM10 */}
    <circle cx="17" cy="18" r="3.5" fill="#ffffff" />
    <path d="M11 28C11 25 14 23 17 23C20 23 23 25 23 28" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    <text x="17" y="35" textAnchor="middle" fill="#fde047" fontSize="5" fontWeight="900">RM10</text>

    {/* Right Notch: Checkmark Meter */}
    <circle cx="35" cy="24" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.4" />
    <path d="M33 24L34.5 25.5L37.5 22.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 9. EVENT LOCATION PIN WITH PASAR TENT
export const EventTentPinIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="pinGrad" x1="12" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
    <ellipse cx="24" cy="43" rx="10" ry="3" fill="#0f172a" fillOpacity="0.15" />
    {/* Map Pin Geometry */}
    <path
      d="M24 4C14.5 4 8 11.5 8 20.5C8 30 20 40 24 43C28 40 40 30 40 20.5C40 11.5 33.5 4 24 4Z"
      fill="url(#pinGrad)"
      stroke="#064e3b"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="19" r="11" fill="#ffffff" />
    {/* Little Agro Tent inside */}
    <path d="M17 21L24 14L31 21H17Z" fill="#15803d" stroke="#14532d" strokeWidth="1" />
    <line x1="19" y1="21" x2="19" y2="25" stroke="#71717a" strokeWidth="1.2" />
    <line x1="29" y1="21" x2="29" y2="25" stroke="#71717a" strokeWidth="1.2" />
    <line x1="18" y1="25" x2="30" y2="25" stroke="#ca8a04" strokeWidth="1.5" />
  </svg>
);

// 10. HAD MASA & PELUPUSAN AUTOMATIK (Hourglass Countdown with Auto-Expiry Strike)
export const AutoExpiryHourglassIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="sandGrad" x1="16" y1="12" x2="32" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <ellipse cx="24" cy="43" rx="14" ry="2.5" fill="#0f172a" fillOpacity="0.12" />

    {/* Hourglass Frame */}
    <rect x="12" y="7" width="24" height="4" rx="2" fill="#71717a" stroke="#3f3f46" strokeWidth="1.4" />
    <rect x="12" y="37" width="24" height="4" rx="2" fill="#71717a" stroke="#3f3f46" strokeWidth="1.4" />

    {/* Glass Bulbs */}
    <path
      d="M15 11C15 21 21 23 24 24C27 23 33 21 33 11H15Z"
      fill="#e0f2fe"
      fillOpacity="0.6"
      stroke="#0284c7"
      strokeWidth="1.6"
    />
    <path
      d="M15 37C15 27 21 25 24 24C27 25 33 27 33 37H15Z"
      fill="#e0f2fe"
      fillOpacity="0.6"
      stroke="#0284c7"
      strokeWidth="1.6"
    />

    {/* Falling Sand stream & bottom pyramid */}
    <path d="M19 13C19 17 22 18 24 19C26 18 29 17 29 13H19Z" fill="url(#sandGrad)" />
    <line x1="24" y1="21" x2="24" y2="30" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="1 2" />
    <path d="M18 36C20 32 28 32 30 36H18Z" fill="url(#sandGrad)" />

    {/* Alert Expiry Badge */}
    <circle cx="35" cy="14" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />
    <text x="35" y="17" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="900">!</text>
  </svg>
);

// 11. DYNAMIC PRODUCE ICON SELECTOR (Dispatches bespoke item-specific icons)
export const ItemProduceIcon: React.FC<{
  type?: 'CHICKEN' | 'EGGS' | 'FRUITS' | 'VEG' | 'RICE' | 'FISH' | string;
  category?: string;
  className?: string;
  size?: number;
}> = ({ type, category, className = 'w-6 h-6', size }) => {
  const key = (type || category || '').toUpperCase();

  if (key.includes('CHICKEN') || key.includes('AYAM') || key.includes('DAGING')) {
    return <ChickenProduceIcon className={className} size={size} />;
  }
  if (key.includes('EGG') || key.includes('TELUR')) {
    return <EggCrateIcon className={className} size={size} />;
  }
  if (key.includes('FRUIT') || key.includes('BUAH') || key.includes('NENAS') || key.includes('TEMBIKAI')) {
    return <PineappleMelonIcon className={className} size={size} />;
  }
  if (key.includes('VEG') || key.includes('SAYUR') || key.includes('BAYAM') || key.includes('CILI')) {
    return <KampungVegIcon className={className} size={size} />;
  }
  if (key.includes('RICE') || key.includes('BERAS') || key.includes('KEPERLUAN')) {
    return <RicePaddyIcon className={className} size={size} />;
  }
  if (key.includes('FISH') || key.includes('IKAN') || key.includes('LAUT')) {
    return <FreshFishIcon className={className} size={size} />;
  }

  return <PasarStallIcon className={className} size={size} />;
};

// 12. WEB NFC CONTACTLESS TAP ICON (Agro MADANI 4-Wave Radio Signal & Smart Chip)
export const NfcContactlessIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="nfcWaveGrad" x1="12" y1="8" x2="42" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" />
        <stop offset="0.5" stopColor="#06b6d4" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="nfcCardGrad" x1="4" y1="12" x2="26" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064e3b" />
        <stop offset="1" stopColor="#0f172a" />
      </linearGradient>
    </defs>

    {/* Smart Card Base */}
    <rect
      x="4"
      y="12"
      width="22"
      height="28"
      rx="4"
      fill="url(#nfcCardGrad)"
      stroke="#10b981"
      strokeWidth="1.6"
    />
    
    {/* Microchip */}
    <rect x="7" y="16" width="6" height="5" rx="1" fill="#f59e0b" stroke="#fef08a" strokeWidth="0.8" />
    <line x1="10" y1="16" x2="10" y2="21" stroke="#b45309" strokeWidth="0.6" />
    <line x1="7" y1="18.5" x2="13" y2="18.5" stroke="#b45309" strokeWidth="0.6" />

    {/* Card Decorative lines */}
    <line x1="7" y1="26" x2="22" y2="26" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <line x1="7" y1="30" x2="18" y2="30" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <circle cx="20" cy="34" r="2" fill="#fbbf24" />

    {/* 4 Radiating Contactless Radio Waves */}
    {/* Wave 1 (Inner) */}
    <path
      d="M27 21C28.8 22.8 28.8 25.8 27 27.6"
      stroke="url(#nfcWaveGrad)"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Wave 2 */}
    <path
      d="M31 17C34.8 20.8 34.8 27.2 31 31"
      stroke="url(#nfcWaveGrad)"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Wave 3 */}
    <path
      d="M35.5 13C41 18.5 41 29 35.5 34.5"
      stroke="url(#nfcWaveGrad)"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Wave 4 (Outer) */}
    <path
      d="M40 9C47.2 16.2 47.2 31.8 40 39"
      stroke="url(#nfcWaveGrad)"
      strokeWidth="2.4"
      strokeLinecap="round"
      opacity="0.85"
    />
  </svg>
);


