import React from 'react';

interface SchoolCrestProps {
  className?: string;
  size?: number | string;
}

export const SchoolCrest: React.FC<SchoolCrestProps> = ({ className = '', size = 120 }) => {
  return (
    <svg
      className={`select-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Curved Path for top header text */}
        <path
          id="textPathTop"
          d="M 68,250 A 182,182 0 0,1 432,250"
          fill="none"
        />
        {/* Curved Path for the bottom ribbon text */}
        <path
          id="ribbonTextPath"
          d="M 148,421 C 185,445 315,445 352,421"
          fill="none"
        />
        {/* Clip path for the central shield circle */}
        <clipPath id="shieldClip">
          <circle cx="250" cy="245" r="130" />
        </clipPath>
      </defs>

      {/* Outer Circle Ring */}
      <circle cx="250" cy="250" r="240" fill="#0a5c43" />
      
      {/* Deep Green Border Rim */}
      <circle cx="250" cy="250" r="235" fill="none" stroke="#ffffff" strokeWidth="3" />
      
      {/* Inner Cream/Off-white Ring Background */}
      <circle cx="250" cy="250" r="225" fill="#f5f1ed" />
      <circle cx="250" cy="250" r="224" fill="none" stroke="#0a5c43" strokeWidth="1" />

      {/* Header Text curved along the top and formatted beautifully */}
      <text fill="#053e2e" className="font-display font-black">
        <textPath
          href="#textPathTop"
          startOffset="50%"
          textAnchor="middle"
          style={{
            fontSize: '32px',
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 900,
            letterSpacing: '1px'
          }}
        >
          SAAKO HOLY CHILD ACADEMY
        </textPath>
      </text>

      {/* Central Shield Group (Radius 130 centered at cx=250, cy=245) */}
      <g clipPath="url(#shieldClip)">
        {/* Top Half of Shield (Teal) */}
        <rect x="110" y="105" width="280" height="142" fill="#00a87f" />
        
        {/* Bottom Left Quadrant of Shield (Dark Green) */}
        <rect x="110" y="247" width="140" height="140" fill="#004d38" />
        
        {/* Bottom Right Quadrant of Shield (Off-white / Warm Gray) */}
        <rect x="250" y="247" width="140" height="140" fill="#fcfbfc" />

        {/* --- ELEMENTS INSIDE QUADRANTS --- */}

        {/* 1. TOP SHIELD ELEMENT: Open Book & Pen */}
        <g transform="translate(0, 0)">
          {/* Cover / Pages backing */}
          <path
            d="M 250,215 C 230,202 185,200 162,208 L 162,168 C 185,160 230,162 250,175 C 270,162 315,160 338,168 L 338,208 C 315,200 270,202 250,215 Z"
            fill="#097a5c"
            opacity="0.2"
          />
          {/* Book Pages */}
          {/* Left Page */}
          <path
            d="M 250,210 C 230,197 185,195 165,203 L 165,165 C 185,157 230,159 250,172 Z"
            fill="#e1f7f2"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Right Page */}
          <path
            d="M 250,210 C 270,197 315,195 335,203 L 335,165 C 315,157 270,159 250,172 Z"
            fill="#e1f7f2"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Book middle spine line */}
          <line x1="250" y1="172" x2="250" y2="210" stroke="#004d38" strokeWidth="2.5" />

          {/* Book Lines left */}
          <path d="M 180,180 H 230" stroke="#008c69" strokeWidth="1.5" opacity="0.6" />
          <path d="M 175,188 H 230" stroke="#008c69" strokeWidth="1.5" opacity="0.6" />
          <path d="M 180,196 H 230" stroke="#008c69" strokeWidth="1.5" opacity="0.6" />

          {/* Book Lines right */}
          <path d="M 270,180 H 320" stroke="#008c69" strokeWidth="1.5" opacity="0.6" />
          <path d="M 270,188 H 325" stroke="#008c69" strokeWidth="1.5" opacity="0.6" />
          <path d="M 270,196 H 320" stroke="#008c69" strokeWidth="1.5" opacity="0.6" />

          {/* Pen sitting across the right page */}
          <g transform="translate(230, 133) rotate(34)">
            {/* Pen Body */}
            <rect x="0" y="0" width="8" height="64" rx="3" fill="#ffffff" stroke="#097a5c" strokeWidth="1" />
            <rect x="2" y="10" width="4" height="42" fill="#00a87f" />
            {/* Pen cap clip */}
            <path d="M -1,45 H 9 V 49 H -1 Z" fill="#ffffff" stroke="#097a5c" strokeWidth="1" />
            <path d="M 4,49 V 60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Pen tip */}
            <path d="M 0,0 L 4,-8 L 8,0 Z" fill="#334155" />
          </g>
        </g>

        {/* 2. BOTTOM-LEFT SHIELD ELEMENT: Farm Tools (Machete/Cutlass & Hoe) */}
        <g transform="translate(180, 305)">
          {/* Wooden Shaft of Hoe */}
          <line x1="-32" y1="12" x2="28" y2="-20" stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />
          {/* Hoe Metal Joint & Blade */}
          <path d="M -30,10 L -42,3 L -46,23 L -33,26 Z" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M -41,17 L -32,23" stroke="#475569" strokeWidth="1.5" />

          {/* Machete/Cutlass crossing the other way */}
          <g transform="rotate(-40)">
            {/* Handle */}
            <rect x="-2" y="-28" width="5" height="13" rx="1" fill="#78350f" />
            {/* Blade */}
            <path d="M 0,-15 C -1,-15 -2,5 -1,28 C -0.5,32 5,30 6,24 C 7,8 5,-15 1,-15 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="2" y1="-12" x2="2" y2="22" stroke="#94a3b8" strokeWidth="1" />
          </g>
        </g>

        {/* 3. BOTTOM-RIGHT SHIELD ELEMENT: Traditional Ghanaian Broom */}
        <g transform="translate(320, 305) rotate(42)">
          {/* Broomstick grouping */}
          {/* Bundle Handle Wrap (Black rope) */}
          <rect x="-8" y="-30" width="16" height="12" rx="2" fill="#0f172a" />
          <line x1="-8" y1="-24" x2="8" y2="-24" stroke="#ffffff" strokeWidth="1" />
          
          {/* Bristles extending downwards, tapering outward */}
          <path
            d="M -7,-18 L -24,35 C -15,38 15,38 24,35 L 7,-18 Z"
            fill="#475569"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Individual Fibers / Lines */}
          <line x1="-5" y1="-18" x2="-22" y2="34" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="-2" y1="-18" x2="-12" y2="35" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="0" y1="-18" x2="0" y2="35" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="2" y1="-18" x2="12" y2="35" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="5" y1="-18" x2="22" y2="34" stroke="#1e293b" strokeWidth="1.2" />

          {/* Secondary fiber details */}
          <line x1="-4" y1="5" x2="-8" y2="32" stroke="#94a3b8" strokeWidth="1" opacity="0.4" />
          <line x1="4" y1="5" x2="8" y2="32" stroke="#94a3b8" strokeWidth="1" opacity="0.4" />
        </g>
      </g>

      {/* Thick Shield Outline Frame */}
      <circle cx="250" cy="245" r="130" fill="none" stroke="#004d38" strokeWidth="7" />

      {/* SAWLA text in bold underneath the shield */}
      <text
        x="250"
        y="393"
        textAnchor="middle"
        fill="#052e22"
        style={{
          fontSize: '25px',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
          fontWeight: 900,
          letterSpacing: '0.5px'
        }}
      >
        Sawla
      </text>

      {/* --- RIBBON BANNER & MOTTO "Holiness Is Our Key" --- */}
      {/* Ribbon Shape Shadow */}
      <path
        d="M 120,418 C 165,449 335,449 380,418 C 392,429 382,442 370,448 C 325,472 175,472 130,448 C 118,442 108,429 120,418 Z"
        fill="#04271c"
        opacity="0.25"
      />
      {/* Ribbon Main Body */}
      <path
        d="M 124,415 C 168,446 332,446 376,415 C 385,425 375,437 365,443 C 320,466 180,466 135,443 C 125,437 115,425 124,415 Z"
        fill="#004d38"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Ribbon left folded tail */}
      <path
        d="M 124,415 L 110,432 L 132,434 Z"
        fill="#023a2b"
        stroke="#ffffff"
        strokeWidth="1"
      />
      {/* Ribbon right folded tail */}
      <path
        d="M 376,415 L 390,432 L 368,434 Z"
        fill="#023a2b"
        stroke="#ffffff"
        strokeWidth="1"
      />

      {/* Ribbon Curved Text */}
      <text fill="#ffffff">
        <textPath
          href="#ribbonTextPath"
          startOffset="50%"
          textAnchor="middle"
          style={{
            fontSize: '14.5px',
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 700,
            letterSpacing: '0.2px'
          }}
        >
          Holiness Is Our Key
        </textPath>
      </text>

      {/* --- ESTABLISHED YEAR CIRCULAR BADGES "20" & "03" --- */}
      {/* Left Badge: 20 */}
      <g transform="translate(108, 350)">
        <circle cx="20" cy="20" r="23" fill="#004d38" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="20" fill="none" stroke="#00a87f" strokeWidth="1" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fill="#ffffff"
          style={{
            fontSize: '18px',
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 900
          }}
        >
          20
        </text>
      </g>

      {/* Right Badge: 03 */}
      <g transform="translate(352, 350)">
        <circle cx="20" cy="20" r="23" fill="#004d38" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="20" fill="none" stroke="#00a87f" strokeWidth="1" />
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fill="#ffffff"
          style={{
            fontSize: '18px',
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 900
          }}
        >
          03
        </text>
      </g>
    </svg>
  );
};
