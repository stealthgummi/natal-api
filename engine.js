/**
 * AstroSvgEngine - Headless Astrological SVG Vector Generator
 * 
 * Features:
 * - Mathematical coordinate mapping with Ascendant on the left (9 o'clock / 180 deg)
 * - Dynamic collision-avoidance / radial displacement algorithm for tight stelliums
 * - Aspect chord calculation with orb tightness mapping
 * - Themeable styling (Midnight OLED, Editorial Noir, Cyberpunk, Ethereal Pastel)
 * - Semantic SVG markup with data attributes for interactive frontend hooks
 */

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'fire', ruler: 'Mars' },
  { name: 'Taurus', symbol: '♉', element: 'earth', ruler: 'Venus' },
  { name: 'Gemini', symbol: '♊', element: 'air', ruler: 'Mercury' },
  { name: 'Cancer', symbol: '♋', element: 'water', ruler: 'Moon' },
  { name: 'Leo', symbol: '♌', element: 'fire', ruler: 'Sun' },
  { name: 'Virgo', symbol: '♍', element: 'earth', ruler: 'Mercury' },
  { name: 'Libra', symbol: '♎', element: 'air', ruler: 'Venus' },
  { name: 'Scorpio', symbol: '♏', element: 'water', ruler: 'Pluto' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire', ruler: 'Jupiter' },
  { name: 'Capricorn', symbol: '♑', element: 'earth', ruler: 'Saturn' },
  { name: 'Aquarius', symbol: '♒', element: 'air', ruler: 'Uranus' },
  { name: 'Pisces', symbol: '♓', element: 'water', ruler: 'Neptune' }
];

const PLANET_DATA = {
  Sun: { symbol: '☉', color: '#FFB800' },
  Moon: { symbol: '☽', color: '#E0E6ED' },
  Mercury: { symbol: '☿', color: '#00F0FF' },
  Venus: { symbol: '♀', color: '#00E599' },
  Mars: { symbol: '♂', color: '#FF3366' },
  Jupiter: { symbol: '♃', color: '#B57CFF' },
  Saturn: { symbol: '♄', color: '#FFB020' },
  Uranus: { symbol: '♅', color: '#00D8F6' },
  Neptune: { symbol: '♆', color: '#4D96FF' },
  Pluto: { symbol: '♇', color: '#9D4EDD' },
  Chiron: { symbol: '⚷', color: '#F77F00' },
  NorthNode: { symbol: '☊', color: '#FCBF49' }
};

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8, color: '#FFB800', type: 'major' },
  { name: 'Sextile', angle: 60, orb: 6, color: '#00E599', type: 'soft' },
  { name: 'Square', angle: 90, orb: 7, color: '#FF3366', type: 'hard' },
  { name: 'Trine', angle: 120, orb: 8, color: '#00F0FF', type: 'soft' },
  { name: 'Opposition', angle: 180, orb: 8, color: '#B57CFF', type: 'hard' }
];

const THEMES = {
  midnight: {
    name: 'Midnight OLED',
    bg: '#08090D',
    ringBg: '#0F121C',
    zodiacBg: '#131826',
    border: '#1E2638',
    subtleBorder: '#161D2C',
    text: '#E2E8F0',
    textMuted: '#64748B',
    accent: '#00F0FF',
    aspectTrine: '#00F0FF',
    aspectSquare: '#FF3366',
    aspectOpposition: '#B57CFF',
    aspectSextile: '#00E599',
    aspectConjunction: '#FFB800',
    elements: {
      fire: '#FF3366',
      earth: '#00E599',
      air: '#00F0FF',
      water: '#B57CFF'
    }
  },
  editorial: {
    name: 'Editorial Noir',
    bg: '#FAF8F5',
    ringBg: '#F3EFE9',
    zodiacBg: '#E9E4DC',
    border: '#2C2A29',
    subtleBorder: '#D8D1C7',
    text: '#1C1917',
    textMuted: '#78716C',
    accent: '#1C1917',
    aspectTrine: '#2563EB',
    aspectSquare: '#DC2626',
    aspectOpposition: '#7C3AED',
    aspectSextile: '#059669',
    aspectConjunction: '#D97706',
    elements: {
      fire: '#DC2626',
      earth: '#16A34A',
      air: '#0284C7',
      water: '#9333EA'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bg: '#05050A',
    ringBg: '#0D0C1D',
    zodiacBg: '#16122E',
    border: '#FF0055',
    subtleBorder: '#3F124D',
    text: '#FDFEFE',
    textMuted: '#A020F0',
    accent: '#00FFFF',
    aspectTrine: '#00FFFF',
    aspectSquare: '#FF0055',
    aspectOpposition: '#FFE600',
    aspectSextile: '#00FF66',
    aspectConjunction: '#FF7700',
    elements: {
      fire: '#FF0055',
      earth: '#00FF66',
      air: '#00FFFF',
      water: '#A020F0'
    }
  },
  pastel: {
    name: 'Ethereal Pastel',
    bg: '#181622',
    ringBg: '#211E30',
    zodiacBg: '#2B263F',
    border: '#453E61',
    subtleBorder: '#342E4B',
    text: '#F3EEFF',
    textMuted: '#9B94B8',
    accent: '#F9A8D4',
    aspectTrine: '#93C5FD',
    aspectSquare: '#FDA4AF',
    aspectOpposition: '#C4B5FD',
    aspectSextile: '#86EFAC',
    aspectConjunction: '#FDE047',
    elements: {
      fire: '#F87171',
      earth: '#4ADE80',
      air: '#38BDF8',
      water: '#A78BFA'
    }
  }
};

class AstroSvgEngine {
  constructor(options = {}) {
    this.size = options.size || 800;
    this.cx = this.size / 2;
    this.cy = this.size / 2;
    this.theme = THEMES[options.theme] || THEMES.midnight;
    
    // Geometry Radii (proportional to viewbox)
    this.rOuter = this.size * 0.46;
    this.rZodiacOuter = this.size * 0.44;
    this.rZodiacInner = this.size * 0.36;
    this.rHouseOuter = this.rZodiacInner;
    this.rPlanetRing = this.size * 0.28;
    this.rAspectHub = this.size * 0.21;
    this.rCenter = this.size * 0.05;
  }

  /**
   * Convert Zodiac Degree (0 to 360) to Chart Screen Angle.
   * Standard astrology: Ascendant degree is positioned at 180° (west / 9 o'clock).
   * Zodiac signs move counter-clockwise.
   */
  degToScreenAngle(degree, ascDegree = 0) {
    // Offset from ASC: 0 at ASC means 180° in canvas coords.
    // As degree increases, we turn counter-clockwise (angle decreases in standard screen space).
    const diff = (degree - ascDegree + 360) % 360;
    const screenAngle = (180 - diff + 360) % 360;
    return screenAngle;
  }

  polarToCartesian(cx, cy, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians)
    };
  }

  describeArc(x, y, innerRadius, outerRadius, startAngle, endAngle) {
    const startOuter = this.polarToCartesian(x, y, outerRadius, startAngle);
    const endOuter = this.polarToCartesian(x, y, outerRadius, endAngle);
    const startInner = this.polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = this.polarToCartesian(x, y, innerRadius, startAngle);

    const arcSweep = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${arcSweep} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${arcSweep} 0 ${endInner.x} ${endInner.y}`,
      'Z'
    ].join(' ');
  }

  /**
   * Calculate planetary aspects
   */
  calculateAspects(planets) {
    const results = [];
    const keys = Object.keys(planets);

    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const p1 = planets[keys[i]];
        const p2 = planets[keys[j]];
        
        let diff = Math.abs(p1.degree - p2.degree);
        if (diff > 180) diff = 360 - diff;

        for (const aspect of ASPECTS) {
          const orb = Math.abs(diff - aspect.angle);
          if (orb <= aspect.orb) {
            const tightness = 1 - orb / aspect.orb; // 1 = exact, 0 = edge of orb
            results.push({
              planet1: keys[i],
              planet2: keys[j],
              aspect: aspect.name,
              angle: aspect.angle,
              orb: orb.toFixed(2),
              tightness,
              color: this.theme[`aspect${aspect.name}`] || aspect.color
            });
            break;
          }
        }
      }
    }
    return results;
  }

  /**
   * Stellium Collision Avoidance Algorithm:
   * Fans clustered planets out radially and angularly so glyphs never overlap.
   */
  layoutPlanets(planets, ascDegree) {
    const list = Object.entries(planets).map(([name, data]) => {
      const screenAngle = this.degToScreenAngle(data.degree, ascDegree);
      const signIndex = Math.floor(data.degree / 30);
      const degInSign = (data.degree % 30).toFixed(1);
      return {
        name,
        symbol: PLANET_DATA[name]?.symbol || '★',
        color: PLANET_DATA[name]?.color || this.theme.accent,
        degree: data.degree,
        house: data.house || 1,
        sign: ZODIAC_SIGNS[signIndex],
        degInSign,
        exactAngle: screenAngle,
        displayAngle: screenAngle,
        radialOffset: 0
      };
    });

    // Sort by exact angle
    list.sort((a, b) => a.exactAngle - b.exactAngle);

    const minAngularSeparation = 7.0; // degrees minimum between glyphs
    const adjusted = [...list];

    // Iterative push apart algorithm
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < adjusted.length; i++) {
        for (let j = i + 1; j < adjusted.length; j++) {
          let delta = adjusted[j].displayAngle - adjusted[i].displayAngle;
          if (delta < 0) delta += 360;

          if (delta < minAngularSeparation) {
            const shift = (minAngularSeparation - delta) / 2;
            adjusted[i].displayAngle = (adjusted[i].displayAngle - shift + 360) % 360;
            adjusted[j].displayAngle = (adjusted[j].displayAngle + shift) % 360;
            adjusted[j].radialOffset = (j % 2 === 1) ? 14 : -14; // alternate tiers
          }
        }
      }
    }

    return adjusted;
  }

  /**
   * Generate Full SVG Markup
   */
  render(chartData) {
    const ascDegree = chartData.ascendant || 0;
    const planets = this.layoutPlanets(chartData.planets, ascDegree);
    const aspects = this.calculateAspects(chartData.planets);
    const houses = chartData.houses || this.defaultHouses(ascDegree);

    const t = this.theme;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.size} ${this.size}" width="100%" height="100%" class="astro-chart-svg" style="background-color: ${t.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select: none;">\n`;

    // 1. Defs & Gradients
    svg += `  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${t.bg}" stop-opacity="0" />
    </radialGradient>
  </defs>\n`;

    // 2. Background Base
    svg += `  <!-- Background -->\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rOuter}" fill="${t.ringBg}" stroke="${t.border}" stroke-width="1.5" />\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rAspectHub}" fill="url(#centerGlow)" stroke="${t.subtleBorder}" stroke-width="1" />\n`;

    // 3. Zodiac Wheel (12 Signs)
    svg += `  <!-- Zodiac Wheel -->\n  <g class="zodiac-ring">\n`;
    for (let i = 0; i < 12; i++) {
      const signDegStart = i * 30;
      const signDegEnd = (i + 1) * 30;
      const startAngle = this.degToScreenAngle(signDegStart, ascDegree);
      const endAngle = this.degToScreenAngle(signDegEnd, ascDegree);
      const sign = ZODIAC_SIGNS[i];
      const elemColor = t.elements[sign.element];

      // Note: angles move backwards for counter-clockwise
      const arcPath = this.describeArc(this.cx, this.cy, this.rZodiacInner, this.rZodiacOuter, endAngle, startAngle);

      svg += `    <path d="${arcPath}" fill="${t.zodiacBg}" stroke="${t.subtleBorder}" stroke-width="0.75" class="zodiac-segment" data-sign="${sign.name}" />\n`;

      // Sign glyph placed in middle
      const midAngle = this.degToScreenAngle(signDegStart + 15, ascDegree);
      const glyphPos = this.polarToCartesian(this.cx, this.cy, (this.rZodiacInner + this.rZodiacOuter) / 2, midAngle);

      svg += `    <text x="${glyphPos.x}" y="${glyphPos.y + 5}" text-anchor="middle" font-size="15" fill="${elemColor}" font-weight="bold">${sign.symbol}</text>\n`;
    }

    // Outer Degree Ticks
    for (let d = 0; d < 360; d += 5) {
      const angle = this.degToScreenAngle(d, ascDegree);
      const isMajor = d % 30 === 0;
      const tickLen = isMajor ? 8 : (d % 10 === 0 ? 5 : 3);
      const p1 = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter, angle);
      const p2 = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter + tickLen, angle);
      svg += `    <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${isMajor ? t.border : t.subtleBorder}" stroke-width="${isMajor ? 1.5 : 0.8}" />\n`;
    }
    svg += `  </g>\n`;

    // 4. House Cusps (12 Houses)
    svg += `  <!-- House Cusps -->\n  <g class="house-cusps">\n`;
    for (let h = 0; h < 12; h++) {
      const cuspDeg = houses[h];
      const screenAngle = this.degToScreenAngle(cuspDeg, ascDegree);
      const isAngle = (h === 0 || h === 3 || h === 6 || h === 9); // ASC, IC, DSC, MC
      const strokeWidth = isAngle ? 2 : 0.75;
      const strokeColor = isAngle ? t.accent : t.subtleBorder;

      const pOuter = this.polarToCartesian(this.cx, this.cy, this.rZodiacInner, screenAngle);
      const pInner = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, screenAngle);

      svg += `    <line x1="${pOuter.x}" y1="${pOuter.y}" x2="${pInner.x}" y2="${pInner.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${isAngle ? 'none' : '3 3'}" />\n`;

      // House Number Label
      const nextCusp = houses[(h + 1) % 12];
      let houseMidDeg = (cuspDeg + ((nextCusp - cuspDeg + 360) % 360) / 2) % 360;
      const numAngle = this.degToScreenAngle(houseMidDeg, ascDegree);
      const numPos = this.polarToCartesian(this.cx, this.cy, this.rAspectHub + 16, numAngle);

      svg += `    <text x="${numPos.x}" y="${numPos.y + 4}" text-anchor="middle" font-size="10" fill="${t.textMuted}" font-weight="600">${h + 1}</text>\n`;
    }

    // ASC / MC Axis callout labels
    const ascPos = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter + 22, 180);
    svg += `    <text x="${ascPos.x}" y="${ascPos.y + 4}" text-anchor="end" font-size="12" font-weight="bold" fill="${t.accent}">ASC</text>\n`;
    
    const mcDeg = houses[9] || (ascDegree + 270) % 360;
    const mcAngle = this.degToScreenAngle(mcDeg, ascDegree);
    const mcPos = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter + 22, mcAngle);
    svg += `    <text x="${mcPos.x}" y="${mcPos.y + 4}" text-anchor="middle" font-size="12" font-weight="bold" fill="${t.accent}">MC</text>\n`;
    svg += `  </g>\n`;

    // 5. Aspect Chords (Center Web)
    svg += `  <!-- Aspect Chords -->\n  <g class="aspect-chords">\n`;
    for (const asp of aspects) {
      const p1 = planets.find(p => p.name === asp.planet1);
      const p2 = planets.find(p => p.name === asp.planet2);
      if (!p1 || !p2) continue;

      const pt1 = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, p1.exactAngle);
      const pt2 = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, p2.exactAngle);

      const opacity = (0.25 + asp.tightness * 0.7).toFixed(2);
      const strokeWidth = (0.8 + asp.tightness * 1.5).toFixed(1);

      svg += `    <line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${asp.color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" class="aspect-line" data-aspect="${asp.aspect}" data-orb="${asp.orb}" data-planets="${asp.planet1}-${asp.planet2}">
      <title>${asp.planet1} ${asp.aspect} ${asp.planet2} (Orb: ${asp.orb}°)</title>
    </line>\n`;
    }
    svg += `  </g>\n`;

    // 6. Planets & Leader Lines (The Collision-Avoidance Layer)
    svg += `  <!-- Planets & Collision Avoidance Leader Lines -->\n  <g class="planets-layer">\n`;
    for (const p of planets) {
      const radius = this.rPlanetRing + p.radialOffset;
      const exactTick = this.polarToCartesian(this.cx, this.cy, this.rZodiacInner, p.exactAngle);
      const hubTick = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, p.exactAngle);
      const glyphPos = this.polarToCartesian(this.cx, this.cy, radius, p.displayAngle);

      // True Celestial Position Tick on Zodiac Ring
      svg += `    <line x1="${hubTick.x}" y1="${hubTick.y}" x2="${exactTick.x}" y2="${exactTick.y}" stroke="${t.subtleBorder}" stroke-width="0.8" />\n`;
      svg += `    <circle cx="${exactTick.x}" cy="${exactTick.y}" r="2" fill="${p.color}" />\n`;

      // If displaced by collision algorithm, draw high-tech sleek leader line
      const isDisplaced = Math.abs(p.exactAngle - p.displayAngle) > 0.5 || p.radialOffset !== 0;
      if (isDisplaced) {
        const leaderBase = this.polarToCartesian(this.cx, this.cy, this.rAspectHub + 6, p.exactAngle);
        svg += `    <line x1="${leaderBase.x}" y1="${leaderBase.y}" x2="${glyphPos.x}" y2="${glyphPos.y}" stroke="${p.color}" stroke-opacity="0.35" stroke-dasharray="2 2" stroke-width="1" />\n`;
      }

      // Planet Node (Circle + Glyph + Degree Tag)
      svg += `    <g class="planet-glyph" id="planet-${p.name.toLowerCase()}" data-planet="${p.name}" data-sign="${p.sign.name}" data-degree="${p.degInSign}" style="cursor: pointer;">
      <circle cx="${glyphPos.x}" cy="${glyphPos.y}" r="13" fill="${t.bg}" stroke="${p.color}" stroke-width="1.5" />
      <text x="${glyphPos.x}" y="${glyphPos.y + 4.5}" text-anchor="middle" font-size="12" fill="${p.color}" font-weight="bold">${p.symbol}</text>
      <text x="${glyphPos.x}" y="${glyphPos.y + 19}" text-anchor="middle" font-size="7.5" fill="${t.textMuted}" font-weight="600">${p.degInSign}°</text>
      <title>${p.name}: ${p.degInSign}° ${p.sign.name} (${p.sign.symbol}) in House ${p.house}</title>
    </g>\n`;
    }
    svg += `  </g>\n`;

    // 7. Center Core Reticle
    svg += `  <!-- Center Reticle -->\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rCenter}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5" />\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="3" fill="${t.accent}" />\n`;

    svg += `</svg>`;
    return svg;
  }

  defaultHouses(ascDegree) {
    // Equal house fallback: each house is 30° from ASC
    const houses = [];
    for (let i = 0; i < 12; i++) {
      houses.push((ascDegree + i * 30) % 360);
    }
    return houses;
  }
}

// Export for Node and Browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AstroSvgEngine, THEMES, ZODIAC_SIGNS, PLANET_DATA, ASPECTS };
}

