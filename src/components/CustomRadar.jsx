import React from 'react';

const CustomRadar = ({ stats, labels }) => {
  // Config
  const size = 300;
  const radius = 90;
  const center = size / 2;

  // Grade Mapping
  const gradeToNumber = (grade) => {
    const map = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, '∞': 6, '?': 0 };
    return map[grade?.toUpperCase()] || 1;
  };

  const keys = ['power', 'speed', 'range', 'durability', 'precision', 'potential'];

  // Calculate Polygon Points
  const calculatePoints = (scaleRef = radius) => {
    return keys.map((key, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const val = gradeToNumber(stats[key]);
      const visualVal = Math.min(val, 5.5);
      const r = (visualVal / 5) * scaleRef;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  };

  const dataPoints = calculatePoints(radius);
  const polygonString = dataPoints.map(p => `${p.x}px ${p.y}px`).join(',');

  // Calculate Ticks for Gauge Ring
  const ticks = [];
  const tickCount = 60; // Like a clock
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * Math.PI * 2;
    const isMajor = i % 5 === 0;
    const innerR = radius + 5;
    const outerR = isMajor ? radius + 15 : radius + 10;
    const x1 = center + innerR * Math.cos(angle);
    const y1 = center + innerR * Math.sin(angle);
    const x2 = center + outerR * Math.cos(angle);
    const y2 = center + outerR * Math.sin(angle);
    ticks.push(
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#000"
        strokeWidth={isMajor ? 2 : 1}
        opacity={0.8}
      />
    );
  }

  // Skeleton Components (Grid & Axes)
  const axes = keys.map((key, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;

    // Axis Lines (Center to Rim)
    const lineX = center + radius * Math.cos(angle);
    const lineY = center + radius * Math.sin(angle);

    // Label Position (Outside the Gauge)
    const labelRadius = radius + 35;
    const labelX = center + labelRadius * Math.cos(angle);
    const labelY = center + labelRadius * Math.sin(angle);

    // Grade Position (Inside the Gauge, Big)
    const gradeRadius = radius * 0.85;
    const gradeX = center + gradeRadius * Math.cos(angle);
    const gradeY = center + gradeRadius * Math.sin(angle);

    const labelName = labels[key] || key.toUpperCase();
    const grade = stats[key] || '?';

    return (
      <g key={key}>
        {/* Axis Line */}
        <line
          x1={center} y1={center} x2={lineX} y2={lineY}
          stroke="#000" strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Small Label Name (Outside) */}
        <text
          x={labelX} y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#000"
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: '"Noto Serif SC", serif',
            textShadow: '0 0 2px #fff' // Halo for readability
          }}
        >
          {labelName}
        </text>

        {/* Big Grade Letter (Inside) */}
        <text
          x={gradeX} y={gradeY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#000"
          style={{
            fontSize: '24px',
            fontWeight: '900',
            fontFamily: '"Cinzel", serif',
            textShadow: '0 0 2px #fff'
          }}
        >
          {grade}
        </text>
      </g>
    );
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'visible' }}>

      {/* 0. Ambient Glow (Backdrop) */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: size * 1.2, height: size * 1.2,
        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      {/* SVG Container */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, overflow: 'visible' }}>
        <defs>
          <filter id="scribble">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>

        {/* 1. Concentric Grid Circles */}
        {[0.2, 0.4, 0.6, 0.8].map((scale, idx) => (
          <circle
            key={`grid-${idx}`}
            cx={center} cy={center} r={radius * scale}
            fill="none"
            stroke="#000"
            strokeWidth="1"
            opacity="0.3"
            strokeDasharray="4 2"
          />
        ))}

        {/* 2. The Main Polygon Fill (Red Ink) */}
        <polygon
          points={polygonString.replace(/px/g, '')}
          fill="rgba(220, 20, 60, 0.85)"
          stroke="none"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* 3. Outer Gauge Ring & Ticks */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#000" strokeWidth="2.5" />
        <circle cx={center} cy={center} r={radius + 5} fill="none" stroke="#000" strokeWidth="1" opacity="0.5" />
        {ticks}

        {/* 4. Axes, Labels & Grades */}
        {axes}

        {/* Center Dot */}
        <circle cx={center} cy={center} r={3} fill="#000" />
      </svg>
    </div>
  );
};
export default CustomRadar;
