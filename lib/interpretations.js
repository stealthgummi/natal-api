/**
 * Interpretive Astrological Archetype Engine
 * 
 * Provides modern, psychological, non-cheesy readings for:
 * - Sun, Moon, Rising (The Big 3)
 * - Mercury, Venus, Mars, Jupiter, Saturn
 * - Major planetary aspects & dynamics
 */

const SIGN_PROFILES = {
  Aries: {
    element: 'Fire',
    quality: 'Cardinal',
    sunArchetype: 'The Trailblazing Pioneer',
    sunReading: 'Driven by initiative, raw courage, and independent action. You thrive when initiating new frontiers rather than maintaining existing structures.',
    moonArchetype: 'The Instinctive Fighter',
    moonReading: 'Your emotional responses are swift, direct, and unfiltered. You process feelings through movement, honesty, and decisive action.',
    risingArchetype: 'The Direct Catalyst',
    risingReading: 'You enter rooms with palpable momentum. The world perceives you as bold, unfiltered, and naturally inclined to lead.'
  },
  Taurus: {
    element: 'Earth',
    quality: 'Fixed',
    sunArchetype: 'The Master Builder',
    sunReading: 'Grounded, patient, and sensory. You turn conceptual ideas into tangible, long-lasting reality through persistent focus.',
    moonArchetype: 'The Unshakeable Anchor (Exalted)',
    moonReading: 'In classical astrology, the Moon is Exalted in Taurus. Your emotional core is grounded, loyal, and built on unwavering patience and genuine peace.',
    risingArchetype: 'The Calming Presence',
    risingReading: 'You project an aura of stability, reliability, and measured calm. People instinctively trust your steadiness.'
  },
  Gemini: {
    element: 'Air',
    quality: 'Mutable',
    sunArchetype: 'The Strategic Connector',
    sunReading: 'Agile, curious, and mentally versatile. You bridge disparate concepts, synthesize information, and thrive on intellectual variety.',
    moonArchetype: 'The Inquisitive Mind',
    moonReading: 'You process emotions through verbal analysis, conversation, and intellectual curiosity. Clarity comes when thoughts are spoken aloud.',
    risingArchetype: 'The Adaptable Communicator',
    risingReading: 'Perceived as witty, observant, and quick on your feet. You navigate dynamic social and professional currents effortlessly.'
  },
  Cancer: {
    element: 'Water',
    quality: 'Cardinal',
    sunArchetype: 'The Empathetic Architect',
    sunReading: 'Guided by instinct, protective loyalty, and emotional depth. You build secure foundations for the people and projects you cherish.',
    moonArchetype: 'The Intuitive Core (Domicile)',
    moonReading: 'The Moon is at home in Cancer. Your emotional intelligence and instinctive radar are exceptionally acute, detecting unspoken currents before anyone else.',
    risingArchetype: 'The Intuitive Guardian',
    risingReading: 'You present with genuine warmth, emotional intelligence, and protective discernment. You read the room instinctively before fully opening up.'
  },
  Leo: {
    element: 'Fire',
    quality: 'Fixed',
    sunArchetype: 'The Sovereign Visionary',
    sunReading: 'Radiant, honorable, and purpose-driven. You lead with genuine warmth, creative vitality, and an instinctive standard of excellence.',
    moonArchetype: 'The Noble Heart',
    moonReading: 'You require emotional authenticity, creative expression, and validation. Your loyalty is absolute when respect is mutual.',
    risingArchetype: 'The Natural Centerpiece',
    risingReading: 'You project authority, creative vitality, and an unmistakable aura of confidence and warmth.'
  },
  Virgo: {
    element: 'Earth',
    quality: 'Mutable',
    sunArchetype: 'The Systems Refiner',
    sunReading: 'Analytical, discerning, and devoted to mastery. You possess an innate genius for optimizing complex processes and elevating quality.',
    moonArchetype: 'The Thoughtful Analyst',
    moonReading: 'You find emotional equilibrium through order, usefulness, and solving practical dilemmas. You care deeply through acts of service.',
    risingArchetype: 'The Observant Strategist',
    risingReading: 'You present as sharp, articulate, and composed. The world perceives you as discerning, capable, and meticulously prepared.'
  },
  Libra: {
    element: 'Air',
    quality: 'Cardinal',
    sunArchetype: 'The Diplomatic Strategist',
    sunReading: 'Driven by aesthetic harmony, equilibrium, and intellectual fairness. You excel at negotiating complexity and designing balance.',
    moonArchetype: 'The Harmony Seeker',
    moonReading: 'Your inner peace requires relational balance, pleasant environments, and fairness. Conflict is processed through perspective and dialogue.',
    risingArchetype: 'The Charming Negotiator',
    risingReading: 'You project elegance, balance, and natural diplomacy. People find you disarming, approachable, and socially graceful.'
  },
  Scorpio: {
    element: 'Water',
    quality: 'Fixed',
    sunArchetype: 'The Transformative Alchemist',
    sunReading: 'Intense, perceptive, and fiercely loyal. You see through superficial pretenses straight into the core truths and leverage points of any situation.',
    moonArchetype: 'The Depth Feeler',
    moonReading: 'You experience emotions with immense power, depth, and resilience. Your vulnerability is private, but your endurance is unmatched.',
    risingArchetype: 'The Magnetic Enigma',
    risingReading: 'You possess a piercing, observant presence. People sense your depth, focus, and quiet authority immediately.'
  },
  Sagittarius: {
    element: 'Fire',
    quality: 'Mutable',
    sunArchetype: 'The Philosophical Pioneer',
    sunReading: 'Expansive, truth-seeking, and optimistic. You are energized by exploration, overarching principles, and visionary possibilities.',
    moonArchetype: 'The Free Spirit',
    moonReading: 'Your emotional health demands freedom, philosophical optimism, and room to grow. You bounce back from setbacks with remarkable resilience.',
    risingArchetype: 'The Expansive Visionary',
    risingReading: 'You project good humor, candid honesty, and an adventurous horizon. People are inspired by your perspective.'
  },
  Capricorn: {
    element: 'Earth',
    quality: 'Fixed',
    sunArchetype: 'The Sovereign Strategist',
    sunReading: 'Pragmatic, disciplined, and relentlessly focused on compounding long-term results. You respect competence and lasting legacy.',
    moonArchetype: 'The Stoic Anchor',
    moonReading: 'You manage emotion with maturity, self-reliance, and pragmatic composure. You take your commitments with immense seriousness.',
    risingArchetype: 'The Authoritative Professional',
    risingReading: 'You project competence, gravity, and understated capability. The world perceives you as someone who gets things done.'
  },
  Aquarius: {
    element: 'Air',
    quality: 'Fixed',
    sunArchetype: 'The Future Architect',
    sunReading: 'Innovative, objective, and egalitarian. You see existing paradigms and instinctively design the next evolution of the system.',
    moonArchetype: 'The Objective Observer',
    moonReading: 'You process feelings through intellectual framing and a bird’s-eye perspective. You value authenticity and freedom above convention.',
    risingArchetype: 'The Unconventional Catalyst',
    risingReading: 'You project uniqueness, intellect, and progressive vision. People recognize you as an independent original.'
  },
  Pisces: {
    element: 'Water',
    quality: 'Mutable',
    sunArchetype: 'The Visionary Mystic & Synthesizer',
    sunReading: 'Boundless imagination, holistic perception, and profound intuition. You perceive patterns and emotional undercurrents that purely rational minds miss.',
    moonArchetype: 'The Ocean of Intuition',
    moonReading: 'Your emotional sensitivity is vast and permeable. You absorb atmospheres naturally and require creative solitude to recharge.',
    risingArchetype: 'The Enigmatic Dreamer',
    risingReading: 'You project an open, creative, and gentle aura. The world perceives you as deeply imaginative, empathetic, and philosophical.'
  }
};

const HOUSE_THEMES = {
  1: 'Identity, Vitality & Personal Initiative',
  2: 'Resources, Self-Worth & Material Foundations',
  3: 'Communication, Mindset & Daily Connections',
  4: 'Home, Roots & Private Foundations',
  5: 'Creative Vitality, Passion & Self-Expression',
  6: 'Systems, Daily Mastery & Execution',
  7: 'Key Partnerships, Contracts & Relationships',
  8: 'Transformation, Shared Resources & Deep Psychology',
  9: 'Higher Philosophy, Vision & Big-Picture Strategy',
  10: 'Legacy, Career Pinnacle & Public Achievement',
  11: 'Networks, Community Alliances & Long-Range Goals',
  12: 'The Subconscious, Creative Solitude & Transcendence'
};

/**
 * Generate Structured Astrological Dossier
 */
function generateDossier(chartData) {
  const planets = chartData.planets;
  const angles = chartData.angles;

  const ascSignIdx = Math.floor(angles.ascendant / 30);
  const ascSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const ascSign = ascSigns[ascSignIdx];

  const sunData = planets.Sun || {};
  const moonData = planets.Moon || {};
  const mercData = planets.Mercury || {};
  const venusData = planets.Venus || {};
  const marsData = planets.Mars || {};
  const jupData = planets.Jupiter || {};
  const satData = planets.Saturn || {};

  const sunProf = SIGN_PROFILES[sunData.sign] || {};
  const moonProf = SIGN_PROFILES[moonData.sign] || {};
  const risingProf = SIGN_PROFILES[ascSign] || {};

  return {
    overview: {
      title: `${sunProf.sunArchetype || 'The Explorer'} with ${moonProf.moonArchetype || 'The Anchor'}`,
      signature_blend: `Sun in ${sunData.sign}, Moon in ${moonData.sign}, Ascendant in ${ascSign}`,
      dominant_elements: {
        sun_element: sunProf.element,
        moon_element: moonProf.element,
        rising_element: risingProf.element
      }
    },
    the_big_three: {
      sun: {
        placement: `Sun in ${sunData.sign} (${sunData.degree_in_sign}° in House ${sunData.house})`,
        archetype: sunProf.sunArchetype,
        house_domain: HOUSE_THEMES[sunData.house],
        reading: sunProf.sunReading
      },
      moon: {
        placement: `Moon in ${moonData.sign} (${moonData.degree_in_sign}° in House ${moonData.house})`,
        archetype: moonProf.moonArchetype,
        house_domain: HOUSE_THEMES[moonData.house],
        reading: moonProf.moonReading
      },
      rising: {
        placement: `Rising in ${ascSign} (${(angles.ascendant % 30).toFixed(1)}°)`,
        archetype: risingProf.risingArchetype,
        domain: 'The Outer Persona & Life Direction',
        reading: risingProf.risingReading
      }
    },
    inner_counsel: {
      intellect_mercury: {
        placement: `Mercury in ${mercData.sign} (House ${mercData.house})`,
        communication_style: `Processes information through ${mercData.sign} qualities, directing thoughts toward ${HOUSE_THEMES[mercData.house] || 'expression'}.`
      },
      values_venus: {
        placement: `Venus in ${venusData.sign} (House ${venusData.house})`,
        attraction_style: `Values relational integrity and aesthetics aligned with ${venusData.sign} principles.`
      },
      drive_mars: {
        placement: `Mars in ${marsData.sign} (House ${marsData.house})`,
        execution_style: `Takes decisive action with ${marsData.sign} tenacity and focus.`
      },
      expansion_jupiter: {
        placement: `Jupiter in ${jupData.sign} (House ${jupData.house})`,
        growth_style: `Unlocks fortune and wisdom when operating in ${jupData.sign} domains.`
      },
      discipline_saturn: {
        placement: `Saturn in ${satData.sign} (House ${satData.house})`,
        mastery_lesson: `Builds enduring authority and mastery through patient dedication in House ${satData.house}.`
      }
    }
  };
}

module.exports = { generateDossier, SIGN_PROFILES, HOUSE_THEMES };

