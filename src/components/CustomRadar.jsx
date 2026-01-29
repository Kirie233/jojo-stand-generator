import React from 'react';

const CustomRadar = ({ stats, labels }) => {
  // Config
  const size = 300;
  const outerRadius = 100; // The gauge ring
  const chartRadius = 85; // The actual data limits (letters sit here)
  const center = size / 2;

  // Grade Mapping
  const gradeToNumber = (grade) => {
    // S tier (Infinite) -> Full, E -> Center
    // Mapping: None/?:0, E:1, D:2, C:3, B:4, A:5, ∞:6
    const map = { 'NONE': 0, 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, '∞': 6 };
    // Handle "A+" etc if needed, loosely
    const cleanBox = grade?.replace(/[^A-D∞E]/gi, '').toUpperCase() || 'E'; // Default to E if unknown
    // Special handling for infinity symbol if not regex matched
    if (grade?.includes('∞')) return 6;
    if (grade?.toUpperCase() === 'NONE') return 0;

    return map[cleanBox] || map[grade?.charAt(0).toUpperCase()] || 1;
  };

  const keys = ['power', 'speed', 'range', 'durability', 'precision', 'potential'];

  // Angle helper: Rotate -90deg to start at top
  const getAngle = (i) => (Math.PI / 3) * i - Math.PI / 2;

  // Calculate Data Points (The Red Polygon)
  const calculatePoints = () => {
    return keys.map((key, i) => {
      const angle = getAngle(i);
      const val = gradeToNumber(stats[key]);
      // Normalize: Max (∞) = 6. 
      // visualVal 0-1 range
      const normalized = Math.min(val, 6) / 6;
      // Scale to chartRadius
      const r = normalized * chartRadius; // If A (5/6), it's nicely inside. If ∞ (6/6), it hits rim.
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  };

  const dataPoints = calculatePoints();
  const polygonString = dataPoints.map(p => `${p.x} ${p.y}`).join(',');

  // --- RENDERING HELPERS ---

  // 1. The Gauge Ticks (Clock Face)
  const renderTicks = () => {
    const ticks = [];
    const tickCount = 60; // 60 ticks like a watch
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      const isMajor = i % 10 === 0; // Every 10 ticks is major
      const isSectorStart = i % 10 === 0 && (i / 10) % 1 === 0; // Align with axes? No, axes are 6. 60/6 = 10. So every 10 ticks is an axis.

      // Axis alignment check: Indices 0, 10, 20, 30, 40, 50 correspond to the 6 axes
      const isAxis = (i % 10 === 0);

      const rStart = outerRadius;
      const rEnd = isAxis ? outerRadius + 8 : (isMajor ? outerRadius + 5 : outerRadius + 3);
      const width = isAxis ? 2.5 : (isMajor ? 2 : 1);

      const x1 = center + rStart * Math.cos(angle - Math.PI / 2); // Adjust -90 for 12 o'clock start
      const y1 = center + rStart * Math.sin(angle - Math.PI / 2);
      const x2 = center + rEnd * Math.cos(angle - Math.PI / 2);
      const y2 = center + rEnd * Math.sin(angle - Math.PI / 2);

      ticks.push(
        <line key={`t-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth={width} />
      );
    }
    return ticks;
  };

  // 2. The Axes and Letters
  const renderAxes = () => {
    return keys.map((key, i) => {
      const angle = getAngle(i);

      // Axis Line
      const xLine = center + outerRadius * Math.cos(angle);
      const yLine = center + outerRadius * Math.sin(angle);

      // Label (Text Name) - Curved alignment simulation by offset
      // Hardcoded offsets for specific positions to look nicely "around"
      let labelX = center + (outerRadius + 25) * Math.cos(angle);
      let labelY = center + (outerRadius + 25) * Math.sin(angle);

      // Fine tune text anchor
      let anchor = "middle";
      if (i === 1 || i === 2) anchor = "start"; // Right side
      if (i === 4 || i === 5) anchor = "end";   // Left side
      // i=0 is Top (middle), i=3 is Bottom (middle)

      // Grade Letter (Inside chart, constant radius)
      const gradeR = chartRadius - 15; // Slightly inside the data limit area
      // Actually in anime, letters are placed in the "middle" of the pie slice usually? 
      // No, usually at the vertex. The user image shows "A" at the specific axis point.
      // But notice: for "A" stats, the red polygon goes PAST the letter "A". 
      // This implies the letter is at Fixed Position (e.g. at 'B' level or 'C' level physically), 
      // OR the letter is just labeling the axis near the rim.
      // Let's place the letter at a fixed radius (like 80% out) just for display.
      const letterR = outerRadius * 0.75;
      const letterX = center + letterR * Math.cos(angle);
      const letterY = center + letterR * Math.sin(angle);

      return (
        <g key={key}>
          {/* Axis Line */}
          <line x1={center} y1={center} x2={xLine} y2={yLine} stroke="#000" strokeWidth="1" opacity="0.5" />

          {/* Label (Name) */}
          <text
            x={labelX} y={labelY}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#000"
            style={{
              fontFamily: '"Noto Serif SC", serif',
              fontWeight: 900,
              fontSize: '14px',
              textShadow: '0 0 2px #fff'
            }}
          >
            {labels[key]}
          </text>

          {/* Letter Grade (A, B...) */}
          <text
            x={letterX} y={letterY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#000"
            style={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 900,
              fontSize: '24px',
            }}
          >
            {stats[key] || '?'}
          </text>
        </g>
      );
    });
  };

  const ticks = renderTicks();
  const axes = renderAxes();

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* SVG Container */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, overflow: 'visible' }}>
        <defs>
          <filter id="scribble">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
          {/* Metallic Disk Gradient - Like a Silver Coin */}
          <radialGradient id="metal-disk" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e0e0e0" />
            <stop offset="80%" stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#909090" />
          </radialGradient>
          {/* Inner Shadow for depth */}
          <radialGradient id="metal-ring" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </radialGradient>
        </defs>

        {/* 0. The Metal Disk Background (The "Coin") */}
        <circle cx={center} cy={center} r={outerRadius + 8} fill="url(#metal-disk)" stroke="#555" strokeWidth="1" />

        {/* Ring Shadow Overlay */}
        <circle cx={center} cy={center} r={outerRadius + 8} fill="url(#metal-ring)" />

        {/* 1. Concentric Grid Circles */}
        {[0.2, 0.4, 0.6, 0.8].map((scale, idx) => (
          <circle
            key={`grid-${idx}`}
            cx={center} cy={center} r={outerRadius * scale}
            fill="none"
            stroke="#000"
            strokeWidth="1"
            opacity="0.3"
            strokeDasharray="4 2"
          />
        ))}

        {/* 2. The Main Polygon Fill (Red Ink) */}
        <polygon
          points={polygonString}
          fill="rgba(220, 20, 60, 0.6)"
          stroke="#8b0000"
          strokeWidth="2"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* 3. Outer Gauge Ring & Ticks */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#000" strokeWidth="2.5" />
        <circle cx={center} cy={center} r={outerRadius + 5} fill="none" stroke="#000" strokeWidth="1" opacity="0.5" />
        {ticks}

        {/* Axes & Labels */}
        {axes}

        {/* Center Point */}
        <circle cx={center} cy={center} r={4} fill="#000" />
      </svg>
    </div>
  );
};

export default CustomRadar;
