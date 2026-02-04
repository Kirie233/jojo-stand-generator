import React from 'react';

const CustomRadar = ({ stats, labels }) => {
  // Config
  const size = 300;
  const outerRadius = 140; // The Wide Rim Outer Edge
  const innerRadius = 100; // The Wide Rim Inner Edge (Chart Boundary)
  const chartRadius = 95;  // The actual data max radius
  const center = size / 2;

  // Grade Mapping
  const gradeToNumber = (grade) => {
    const map = { 'NONE': 0, 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, '∞': 6, '?': 0 };
    const cleanBox = grade?.replace(/[^A-D∞E?]/gi, '').toUpperCase() || 'E';
    if (grade?.includes('∞')) return 6;
    if (grade?.includes('?')) return 0; // Unknown stats don't extend the polygon
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
      const val = stats ? gradeToNumber(stats[key]) : 0;
      const normalized = Math.min(val, 6) / 6;
      const r = normalized * chartRadius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  };

  const dataPoints = calculatePoints();
  const polygonString = dataPoints.map(p => `${p.x} ${p.y}`).join(',');

  // --- RENDERING HELPERS ---

  // 1. Curved Text Paths (Definitions)
  const renderDefs = () => {
    // We want the text to be centered in the Silver Rim (100-140)
    // Label Path: Near the outer edge
    const labelR = outerRadius - 12;

    return keys.map((key, i) => {
      const angleRad = getAngle(i);
      const isBottom = i >= 2 && i <= 4;

      // Wider arc for smoother rendering
      const startAngle = angleRad - Math.PI / 3.5;
      const endAngle = angleRad + Math.PI / 3.5;

      const createArc = (r, id) => {
        let pathD = "";
        if (isBottom) {
          const x1 = center + r * Math.cos(endAngle);
          const y1 = center + r * Math.sin(endAngle);
          const x2 = center + r * Math.cos(startAngle);
          const y2 = center + r * Math.sin(startAngle);
          pathD = `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
        } else {
          const x1 = center + r * Math.cos(startAngle);
          const y1 = center + r * Math.sin(startAngle);
          const x2 = center + r * Math.cos(endAngle);
          const y2 = center + r * Math.sin(endAngle);
          pathD = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
        }
        return <path id={id} key={id} d={pathD} fill="none" stroke="none" />;
      };

      return (
        <React.Fragment key={`defs-${i}`}>
          {createArc(labelR, `label-path-${i}`)}
        </React.Fragment>
      );
    });
  };

  const renderLabels = () => {
    return keys.map((key, i) => {
      return (
        <text
          key={`lbl-${i}`}
          fill="#111"
          dominantBaseline="middle"
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: 900,
            fontSize: '11px',
            letterSpacing: '1px',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          <textPath href={`#label-path-${i}`} startOffset="50%" textAnchor="middle">
            {labels[key]}
          </textPath>
        </text>
      );
    });
  };

  // 3. BIG GRADES (Now on the Rim, perfectly horizontal)
  const renderBigGrades = () => {
    return keys.map((key, i) => {
      const angle = getAngle(i);
      const r = outerRadius - 32;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);

      return (
        <text
          key={`grade-txt-${i}`}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#111"
          style={{
            fontFamily: '"Times New Roman", serif',
            fontWeight: 900,
            fontSize: '18px',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {stats ? stats[key] : '-'}
        </text>
      );
    });
  };

  // 4. Letters A-E Scales (On one primary axis)
  const renderAxisScales = () => {
    const axisIndex = 0;
    const angle = getAngle(axisIndex);
    const stepSize = chartRadius / 6;
    const letters = ['E', 'D', 'C', 'B', 'A'];

    return letters.map((char, idx) => {
      const dist = (idx + 1) * stepSize;
      const x = center + dist * Math.cos(angle);
      const y = center + dist * Math.sin(angle);
      return (
        <text
          key={`scale-${char}`}
          x={x} y={y}
          fontSize="9px"
          fontWeight="900"
          fill="#333"
          textAnchor="middle"
          dy="-1"
          dx="-4"
        >
          {char}
        </text>
      );
    });
  };

  // 5. Axes Lines with Ticks
  const renderAxes = () => {
    return keys.map((_, i) => {
      const angle = getAngle(i);
      const x2 = center + innerRadius * Math.cos(angle);
      const y2 = center + innerRadius * Math.sin(angle);

      // Ticks on the axis
      const ticks = [];
      const stepSize = chartRadius / 6;
      for (let s = 1; s <= 5; s++) {
        const d = s * stepSize;
        const tx = center + d * Math.cos(angle);
        const ty = center + d * Math.sin(angle);

        // Orthogonal vector for tick line
        const tickLen = 1.6;
        const ox = Math.cos(angle + Math.PI / 2) * tickLen;
        const oy = Math.sin(angle + Math.PI / 2) * tickLen;

        ticks.push(
          <line
            key={`tick-${i}-${s}`}
            x1={tx - ox} y1={ty - oy}
            x2={tx + ox} y2={ty + oy}
            stroke="#000" strokeWidth="0.8" opacity="0.4"
          />
        );
      }

      return (
        <g key={`axis-g-${i}`}>
          <line x1={center} y1={center} x2={x2} y2={y2} stroke="#000" strokeWidth="1" opacity="0.3" />
          {ticks}
        </g>
      );
    });
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          {/* SILVER RIM GRADIENT */}
          <radialGradient id="platinum-metal" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="40%" stopColor="#dcdcdc" />
            <stop offset="80%" stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#808080" />
          </radialGradient>

          {/* GOLD INNER GRADIENT (User Revised) */}
          <radialGradient id="gold-inner" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#fbf9d9" />
            <stop offset="100%" stopColor="#fcf593" />
          </radialGradient>

          <filter id="dropshadow-s">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
          </filter>
          {renderDefs()}
        </defs>

        {/* 1. OUTERSHAPE: The Wide Rim (Silver) */}
        <circle cx={center} cy={center} r={outerRadius} fill="url(#platinum-metal)" stroke="#666" strokeWidth="1" filter="url(#dropshadow-s)" />

        {/* Rim Inner Edge Highlight */}
        <circle cx={center} cy={center} r={innerRadius + 2} fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />

        {/* 2. INNER CIRCLE: Gold/Cream Background */}
        <circle cx={center} cy={center} r={innerRadius} fill="url(#gold-inner)" stroke="#5d4037" strokeWidth="1.5" />

        {/* 3. LABELS & GRADES (ON RIM) */}
        {renderLabels()}
        {renderBigGrades()}

        {/* 4. CHART GRID (Inside Gold Circle) */}
        {[0.2, 0.4, 0.6, 0.8].map(s => (
          <circle key={`g-${s}`} cx={center} cy={center} r={chartRadius * s} fill="none" stroke="#5d4037" strokeWidth="0.5" opacity="0.2" />
        ))}
        {renderAxes()}
        {renderAxisScales()}

        {/* 5. DATA POLYGON */}
        <polygon
          points={polygonString}
          fill="rgba(220, 20, 60, 0.55)"
          stroke="#8b0000"
          strokeWidth="2"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Center Dot */}
        <circle cx={center} cy={center} r={3} fill="#3e2723" />
      </svg>
    </div>
  );
};
export default CustomRadar;
