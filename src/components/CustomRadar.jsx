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
      const rEnd = isAxis ? outerRadius + 8 : (isMajor ? outerRadius + 8 : outerRadius + 4);
      const width = isAxis ? 2 : (isMajor ? 1.5 : 1);

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
      const axisAngleDeg = (angle * 180) / Math.PI; // Convert to degrees

      // Axis Line
      const xLine = center + outerRadius * Math.cos(angle);
      const yLine = center + outerRadius * Math.sin(angle);

      // Label (Text Name) - ROTATED along the ring
      // Position: Sits exactly on the ring or slightly outside
      const labelR = outerRadius + 15;
      const labelX = center + labelR * Math.cos(angle);
      const labelY = center + labelR * Math.sin(angle);

      // Calculate Rotation for Text
      // Top (i=0, -90deg): Text is Horizontal (0 deg rotation) or follows curve?
      // Anime ref: Text is always perpendicular to radius, or tangent? 
      // Reference shows labels are tangent to the circle.
      // Top: Horizontal. Right: Vertical (reading down). Bottom: Upside down (or flipped).
      // Let's simple rotate by axisAngleDeg + 90
      let textRot = axisAngleDeg + 90;

      // Fix readability for bottom half (flip text so it's not upside down completely? Anime keeps it strict circle usually)
      // Anime (Stardust): "Speed" on right is rotated 90. 
      // "Range" on bottom right is 120 approx.
      // Strict rotation:

      const labelTransform = `rotate(${textRot}, ${labelX}, ${labelY})`;

      // Grade Letter (Inside chart)
      // Positioned at a fixed radius inner
      const gradeR = outerRadius * 0.70;
      const letterX = center + gradeR * Math.cos(angle);
      const letterY = center + gradeR * Math.sin(angle);

      return (
        <g key={key}>
          {/* Axis Line */}
          <line x1={center} y1={center} x2={xLine} y2={yLine} stroke="#000" strokeWidth="1.5" opacity="0.6" />

          {/* Label (Name) - ROTATED */}
          <text
            x={labelX} y={labelY}
            textAnchor="middle"
            dominantBaseline="auto" // Changed from middle to sit on line?
            fill="#000"
            transform={labelTransform}
            style={{
              fontFamily: '"Noto Serif SC", serif',
              fontWeight: 900,
              fontSize: '14px',
              textShadow: '0 0 2px #fff',
              letterSpacing: '1px'
            }}
          >
            {labels[key]}
          </text>

          {/* Letter Grade (A, B...) - Heavy Serif */}
          <text
            x={letterX} y={letterY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#000"
            style={{
              fontFamily: '"Times New Roman", Times, serif', // HEAVY SERIF
              fontWeight: 900,
              fontSize: '28px',
              textShadow: '2px 2px 0 rgba(255,255,255,0.8)'
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
        </defs>

        {/* 0. Background Area (Transparent for strict overlay, or slight white for contrast) */}
        {/* User requested strict copy, usually just lines on parchment/bg. Use minimal white wash for contrast. */}
        <circle cx={center} cy={center} r={outerRadius + 15} fill="rgba(255,255,255,0.1)" stroke="none" />

        {/* 1. Concentric Grid Circles (Light) */}
        {[0.2, 0.4, 0.6, 0.8].map((scale, idx) => (
          <circle
            key={`grid-${idx}`}
            cx={center} cy={center} r={outerRadius * scale}
            fill="none"
            stroke="#000"
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}

        {/* 2. The Main Polygon Fill */}
        <polygon
          points={polygonString}
          fill="rgba(220, 50, 50, 0.7)"
          stroke="#8b0000"
          strokeWidth="2"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* 3. Anime Gauge Rings */}
        {/* Inner Ring - Thin */}
        <circle cx={center} cy={center} r={outerRadius - 3} fill="none" stroke="#000" strokeWidth="1" />

        {/* Outer Ring - Thick & Segmented look handled by ticks, this acts as base */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#000" strokeWidth="2.5" />

        {/* Outer Decor Ring (The tracks) */}
        <circle cx={center} cy={center} r={outerRadius + 8} fill="none" stroke="#000" strokeWidth="1.5" />

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
