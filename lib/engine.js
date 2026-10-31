/**
 * AstroOverlayEngine - Transparent Multi-Colored Astrological Vector Overlay
 * 
 * Features:
 * - 100% Transparent background (developers can drop it over ANY skin/wallpaper).
 * - Multi-colored celestial elements:
 *   - Aspect chords color-coded by tension/harmony (Trines=Cyan, Squares=Red, Oppositions=Violet, Sextiles=Emerald, Conjunctions=Gold).
 *   - 12 Zodiac signs color-coded by classical Elements (Fire=Red, Earth=Emerald, Air=Cyan, Water=Violet).
 *   - Planet nodes color-coded by celestial ruler.
 * - Planetary collision avoidance for tight stelliums.
 */

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'fire', color: '#FF3366' },
  { name: 'Taurus', symbol: '♉', element: 'earth', color: '#00E599' },
  { name: 'Gemini', symbol: '♊', element: 'air', color: '#00F0FF' },
  { name: 'Cancer', symbol: '♋', element: 'water', color: '#B57CFF' },
  { name: 'Leo', symbol: '♌', element: 'fire', color: '#FF3366' },
  { name: 'Virgo', symbol: '♍', element: 'earth', color: '#00E599' },
  { name: 'Libra', symbol: '♎', element: 'air', color: '#00F0FF' },
  { name: 'Scorpio', symbol: '♏', element: 'water', color: '#B57CFF' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire', color: '#FF3366' },
  { name: 'Capricorn', symbol: '♑', element: 'earth', color: '#00E599' },
  { name: 'Aquarius', symbol: '♒', element: 'air', color: '#00F0FF' },
  { name: 'Pisces', symbol: '♓', element: 'water', color: '#B57CFF' }
];

const PLANET_DATA = {
  Sun: { symbol: '☉', color: '#FFB800' },
  Moon: { symbol: '☽', color: '#E2E8F0' },
  Mercury: { symbol: '☿', color: '#00F0FF' },
  Venus: { symbol: '♀', color: '#00E599' },
  Mars: { symbol: '♂', color: '#FF3366' },
  Jupiter: { symbol: '♃', color: '#B57CFF' },
  Saturn: { symbol: '♄', color: '#FFB020' },
  Uranus: { symbol: '♅', color: '#38BDF8' },
  Neptune: { symbol: '♆', color: '#818CF8' },
  Pluto: { symbol: '♇', color: '#A855F7' },
  NorthNode: { symbol: '☊', color: '#FCD34D' }
};

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8, color: '#FFB800' },
  { name: 'Sextile', angle: 60, orb: 6, color: '#00E599' },
  { name: 'Square', angle: 90, orb: 7, color: '#FF3366' },
  { name: 'Trine', angle: 120, orb: 8, color: '#00F0FF' },
  { name: 'Opposition', angle: 180, orb: 8, color: '#B57CFF' }
];

class AstroOverlayEngine {
  constructor(options = {}) {
    this.size = options.size || 800;
    this.cx = this.size / 2;
    this.cy = this.size / 2;
    
    // Geometry Radii
    this.rOuter = this.size * 0.46;
    this.rZodiacOuter = this.size * 0.44;
    this.rZodiacInner = this.size * 0.36;
    this.rPlanetRing = this.size * 0.28;
    this.rAspectHub = this.size * 0.21;
    this.rCenter = this.size * 0.04;

    // Neutral framework strokes
    this.frameStroke = options.frameStroke || 'rgba(255, 255, 255, 0.45)';
    this.frameStrokeMuted = options.frameStrokeMuted || 'rgba(255, 255, 255, 0.2)';
    this.accent = '#00F0FF';
  }

  degToScreenAngle(degree, ascDegree = 0) {
    const diff = (degree - ascDegree + 360) % 360;
    return (180 - diff + 360) % 360;
  }

  polarToCartesian(cx, cy, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians)
    };
  }

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
            const tightness = 1 - orb / aspect.orb;
            results.push({
              planet1: keys[i],
              planet2: keys[j],
              aspect: aspect.name,
              angle: aspect.angle,
              orb: orb.toFixed(2),
              tightness,
              color: aspect.color
            });
            break;
          }
        }
      }
    }
    return results;
  }

  layoutPlanets(planets, ascDegree) {
    const list = Object.entries(planets).map(([name, data]) => {
      const screenAngle = this.degToScreenAngle(data.degree, ascDegree);
      const signIndex = Math.floor(data.degree / 30);
      const degInSign = (data.degree % 30).toFixed(1);
      const meta = PLANET_DATA[name] || { symbol: '★', color: '#00F0FF' };
      return {
        name,
        symbol: meta.symbol,
        color: meta.color,
        degree: data.degree,
        house: data.house || 1,
        sign: ZODIAC_SIGNS[signIndex],
        degInSign,
        exactAngle: screenAngle,
        displayAngle: screenAngle,
        radialOffset: 0
      };
    });

    list.sort((a, b) => a.exactAngle - b.exactAngle);

    const minAngularSeparation = 7.0;
    const adjusted = [...list];

    for (let pass = 0; pass < 5; pass++) {
      for (let i = 0; i < adjusted.length; i++) {
        for (let j = i + 1; j < adjusted.length; j++) {
          let delta = adjusted[j].displayAngle - adjusted[i].displayAngle;
          if (delta < 0) delta += 360;

          if (delta < minAngularSeparation) {
            const shift = (minAngularSeparation - delta) / 2;
            adjusted[i].displayAngle = (adjusted[i].displayAngle - shift + 360) % 360;
            adjusted[j].displayAngle = (adjusted[j].displayAngle + shift) % 360;
            adjusted[j].radialOffset = (j % 2 === 1) ? 14 : -14;
          }
        }
      }
    }

    return adjusted;
  }

  render(chartData) {
    const ascDegree = chartData.ascendant || 0;
    const planets = this.layoutPlanets(chartData.planets, ascDegree);
    const aspects = this.calculateAspects(chartData.planets);
    const houses = chartData.houses || [];

    // Standalone Valid SVG with XML declaration and explicit intrinsic dimensions
    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.size} ${this.size}" width="${this.size}" height="${this.size}" class="astro-overlay" style="background: transparent; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select: none;">\n`;

    // 1. Subtle Glow Filter for Aspect Chords
    svg += `  <defs>
    <filter id="chord-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>\n`;

    // 2. Framework Circles (Transparent Fills)
    svg += `  <!-- Framework Circles -->\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rOuter}" fill="none" stroke="${this.frameStrokeMuted}" stroke-width="1" />\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rZodiacOuter}" fill="none" stroke="${this.frameStroke}" stroke-width="1.5" />\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rZodiacInner}" fill="none" stroke="${this.frameStroke}" stroke-width="1.5" />\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rAspectHub}" fill="none" stroke="${this.frameStrokeMuted}" stroke-width="1" />\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="${this.rCenter}" fill="none" stroke="${this.frameStroke}" stroke-width="1.2" />\n`;
    svg += `  <circle cx="${this.cx}" cy="${this.cy}" r="3" fill="${this.accent}" />\n`;

    // 3. Zodiac Wheel (Color-Coded by Element: Fire, Earth, Air, Water)
    svg += `  <!-- Zodiac Band -->\n  <g class="zodiac-segments">\n`;
    for (let i = 0; i < 12; i++) {
      const signDegStart = i * 30;
      const angle = this.degToScreenAngle(signDegStart, ascDegree);
      const sign = ZODIAC_SIGNS[i];

      // Sign boundary tick
      const p1 = this.polarToCartesian(this.cx, this.cy, this.rZodiacInner, angle);
      const p2 = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter, angle);
      svg += `    <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${this.frameStroke}" stroke-width="1.2" />\n`;

      // Multi-colored Element Glyph
      const midAngle = this.degToScreenAngle(signDegStart + 15, ascDegree);
      const glyphPos = this.polarToCartesian(this.cx, this.cy, (this.rZodiacInner + this.rZodiacOuter) / 2, midAngle);
      svg += `    <text x="${glyphPos.x}" y="${glyphPos.y + 5}" text-anchor="middle" font-size="16" fill="${sign.color}" font-weight="bold">${sign.symbol}</text>\n`;
    }

    // Outer Degree Calibration Ticks
    for (let d = 0; d < 360; d += 5) {
      const angle = this.degToScreenAngle(d, ascDegree);
      const isMajor = d % 30 === 0;
      const tickLen = isMajor ? 8 : (d % 10 === 0 ? 5 : 3);
      const p1 = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter, angle);
      const p2 = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter + tickLen, angle);
      svg += `    <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${isMajor ? this.frameStroke : this.frameStrokeMuted}" stroke-width="${isMajor ? 1.2 : 0.75}" />\n`;
    }
    svg += `  </g>\n`;

    // 4. House Rays (12 Cusps)
    svg += `  <!-- House Cusps -->\n  <g class="house-rays">\n`;
    for (let h = 0; h < 12; h++) {
      const cuspDeg = houses[h] !== undefined ? houses[h] : (ascDegree + h * 30) % 360;
      const screenAngle = this.degToScreenAngle(cuspDeg, ascDegree);
      const isAngle = (h === 0 || h === 3 || h === 6 || h === 9); // ASC, IC, DSC, MC
      const strokeWidth = isAngle ? 2 : 0.75;
      const strokeColor = isAngle ? this.accent : this.frameStrokeMuted;

      const pOuter = this.polarToCartesian(this.cx, this.cy, this.rZodiacInner, screenAngle);
      const pInner = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, screenAngle);

      svg += `    <line x1="${pOuter.x}" y1="${pOuter.y}" x2="${pInner.x}" y2="${pInner.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${isAngle ? 'none' : '3 3'}" />\n`;

      // House Number Label
      const nextCusp = houses[(h + 1) % 12] !== undefined ? houses[(h + 1) % 12] : (cuspDeg + 30) % 360;
      let houseMidDeg = (cuspDeg + ((nextCusp - cuspDeg + 360) % 360) / 2) % 360;
      const numAngle = this.degToScreenAngle(houseMidDeg, ascDegree);
      const numPos = this.polarToCartesian(this.cx, this.cy, this.rAspectHub + 15, numAngle);

      svg += `    <text x="${numPos.x}" y="${numPos.y + 4}" text-anchor="middle" font-size="9.5" fill="rgba(255,255,255,0.6)" font-weight="600">${h + 1}</text>\n`;
    }

    // Ascendant (ASC) Callout
    const ascPos = this.polarToCartesian(this.cx, this.cy, this.rZodiacOuter + 22, 180);
    svg += `    <text x="${ascPos.x}" y="${ascPos.y + 4}" text-anchor="end" font-size="12" font-weight="bold" fill="${this.accent}">ASC</text>\n`;
    svg += `  </g>\n`;

    // 5. Multi-Colored Aspect Chords (Center Web)
    // Trines = Cyan, Squares = Red, Oppositions = Violet, Sextiles = Green, Conjunctions = Gold
    svg += `  <!-- Multi-Colored Aspect Chords -->\n  <g class="aspect-chords" filter="url(#chord-glow)">\n`;
    for (const asp of aspects) {
      const p1 = planets.find(p => p.name === asp.planet1);
      const p2 = planets.find(p => p.name === asp.planet2);
      if (!p1 || !p2) continue;

      const pt1 = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, p1.exactAngle);
      const pt2 = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, p2.exactAngle);

      const opacity = (0.35 + asp.tightness * 0.6).toFixed(2);
      const strokeWidth = (0.9 + asp.tightness * 1.5).toFixed(1);

      svg += `    <line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${asp.color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" class="aspect-line" data-aspect="${asp.aspect}" data-orb="${asp.orb}">
      <title>${asp.planet1} ${asp.aspect} ${asp.planet2} (${asp.orb}°)</title>
    </line>\n`;
    }
    svg += `  </g>\n`;

    // 6. Multi-Colored Planet Nodes & Collision Avoidance Leader Lines
    svg += `  <!-- Planets Layer -->\n  <g class="planets-layer">\n`;
    for (const p of planets) {
      const radius = this.rPlanetRing + p.radialOffset;
      const exactTick = this.polarToCartesian(this.cx, this.cy, this.rZodiacInner, p.exactAngle);
      const hubTick = this.polarToCartesian(this.cx, this.cy, this.rAspectHub, p.exactAngle);
      const glyphPos = this.polarToCartesian(this.cx, this.cy, radius, p.displayAngle);

      // True position celestial tick on zodiac ring
      svg += `    <line x1="${hubTick.x}" y1="${hubTick.y}" x2="${exactTick.x}" y2="${exactTick.y}" stroke="${this.frameStrokeMuted}" stroke-width="0.8" />\n`;
      svg += `    <circle cx="${exactTick.x}" cy="${exactTick.y}" r="2" fill="${p.color}" />\n`;

      // Leader line if displaced
      const isDisplaced = Math.abs(p.exactAngle - p.displayAngle) > 0.5 || p.radialOffset !== 0;
      if (isDisplaced) {
        const leaderBase = this.polarToCartesian(this.cx, this.cy, this.rAspectHub + 6, p.exactAngle);
        svg += `    <line x1="${leaderBase.x}" y1="${leaderBase.y}" x2="${glyphPos.x}" y2="${glyphPos.y}" stroke="${p.color}" stroke-opacity="0.4" stroke-dasharray="2 2" stroke-width="1" />\n`;
      }

      // Planet Node (Translucent dark badge with vibrant colored ring & glyph)
      svg += `    <g class="planet-glyph" id="planet-${p.name.toLowerCase()}" data-planet="${p.name}" data-sign="${p.sign.name}" data-deg="${p.degInSign}">
      <circle cx="${glyphPos.x}" cy="${glyphPos.y}" r="13" fill="rgba(10, 12, 18, 0.75)" stroke="${p.color}" stroke-width="1.6" />
      <text x="${glyphPos.x}" y="${glyphPos.y + 4.5}" text-anchor="middle" font-size="12" fill="${p.color}" font-weight="bold">${p.symbol}</text>
      <text x="${glyphPos.x}" y="${glyphPos.y + 19}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,0.7)" font-weight="600">${p.degInSign}°</text>
      <title>${p.name}: ${p.degInSign}° ${p.sign.name} (${p.sign.symbol}) in House ${p.house}</title>
    </g>\n`;
    }
    svg += `  </g>\n`;

    svg += `</svg>`;
    return svg;
  }
}

module.exports = { AstroOverlayEngine, ZODIAC_SIGNS, PLANET_DATA, ASPECTS };
