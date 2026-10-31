/**
 * High-Precision Astronomical Ephemeris & Astrological Calculator
 * Powered by Astronomy Engine (NASA JPL DE405 / VSOP87 precision)
 */

const Astronomy = require('astronomy-engine');
const { findCity, localTimeToUtc } = require('./geo.js');

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const BODIES = [
  { name: 'Sun', key: 'Sun' },
  { name: 'Moon', key: 'Moon' },
  { name: 'Mercury', key: 'Mercury' },
  { name: 'Venus', key: 'Venus' },
  { name: 'Mars', key: 'Mars' },
  { name: 'Jupiter', key: 'Jupiter' },
  { name: 'Saturn', key: 'Saturn' },
  { name: 'Uranus', key: 'Uranus' },
  { name: 'Neptune', key: 'Neptune' },
  { name: 'Pluto', key: 'Pluto' }
];

/**
 * Calculate Mean Lunar Ascending Node (North Node)
 * Meeus Astronomical Algorithms formula
 */
function calculateNorthNode(date) {
  const jd = (date.getTime() / 86400000.0) + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
  omega = ((omega % 360) + 360) % 360;
  return omega;
}

/**
 * Calculate Ascendant (ASC), Midheaven (MC), and Armillary Points
 */
function calculateAngles(date, lat, lon) {
  const time = new Astronomy.AstroTime(date);
  const gastHours = Astronomy.SiderealTime(time);
  const ramcDeg = ((gastHours * 15.0 + lon) % 360 + 360) % 360;
  const eps = Astronomy.e_tilt(time).tobl; // Obliquity of ecliptic

  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const ramcRad = ramcDeg * toRad;
  const epsRad = eps * toRad;
  const latRad = lat * toRad;

  // Midheaven (MC)
  let mc = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)) * toDeg;
  mc = ((mc % 360) + 360) % 360;

  // Ascendant (ASC)
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
  let asc = Math.atan2(y, x) * toDeg;
  asc = ((asc % 360) + 360) % 360;

  // Descendant & IC (Oppositions)
  const dsc = (asc + 180) % 360;
  const ic = (mc + 180) % 360;

  return { asc, mc, dsc, ic, ramc: ramcDeg, obliquity: eps };
}

/**
 * Calculate House Cusps for multiple house systems
 */
function calculateHouses(asc, mc, system = 'whole_sign') {
  const cusps = [];

  if (system === 'whole_sign') {
    // Whole Sign: House 1 starts at 0° of the sign containing the Ascendant
    const ascSignIndex = Math.floor(asc / 30);
    for (let i = 0; i < 12; i++) {
      cusps.push(((ascSignIndex + i) * 30) % 360);
    }
  } else if (system === 'equal') {
    // Equal Houses: each house is exactly 30° starting from the ASC
    for (let i = 0; i < 12; i++) {
      cusps.push((asc + i * 30) % 360);
    }
  } else {
    // Fallback default: Equal Houses
    for (let i = 0; i < 12; i++) {
      cusps.push((asc + i * 30) % 360);
    }
  }

  return cusps;
}

/**
 * Determine which house a planetary degree falls in
 */
function getHouseForDegree(deg, cusps) {
  for (let i = 0; i < 12; i++) {
    const cusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];

    if (cusp < nextCusp) {
      if (deg >= cusp && deg < nextCusp) return i + 1;
    } else {
      // Crosses 0° Aries
      if (deg >= cusp || deg < nextCusp) return i + 1;
    }
  }
  return 1;
}

/**
 * Main Ephemeris Calculation API
 * 
 * @param {Object} params
 * @param {Date|string} params.date - UTC Date or ISO string
 * @param {number} params.latitude - Decimal degrees (-90 to 90)
 * @param {number} params.longitude - Decimal degrees (-180 to 180)
 * @param {string} [params.house_system='whole_sign'] - 'whole_sign' | 'equal'
 */
function calculateNatalChart(params) {
  let lat = (params.latitude !== undefined && params.latitude !== null && params.latitude !== '') ? parseFloat(params.latitude) : null;
  let lon = (params.longitude !== undefined && params.longitude !== null && params.longitude !== '') ? parseFloat(params.longitude) : null;
  let tz = params.timezone || null;
  let resolvedCity = null;

  // 1. Resolve City if provided
  if (params.city) {
    const cityData = findCity(params.city);
    if (cityData) {
      resolvedCity = `${cityData.city}, ${cityData.state ? cityData.state + ', ' : ''}${cityData.country}`;
      lat = cityData.lat;
      lon = cityData.lon;
      if (!tz) tz = cityData.tz;
    }
  }

  // If no city and no coordinates given, fallback to Greenwich
  if (lat === null) lat = 51.5074;
  if (lon === null) lon = -0.1278;
  if (!tz) tz = 'UTC';

  // 2. Resolve UTC Date from Local Time or ISO Date
  let date;
  if (params.birth_date || (params.date && params.time)) {
    const dStr = params.birth_date || params.date;
    const tStr = params.birth_time || params.time || '12:00';
    date = localTimeToUtc(dStr, tStr, tz);
  } else if (params.date instanceof Date) {
    date = params.date;
  } else if (typeof params.date === 'string') {
    date = new Date(params.date);
  } else {
    date = new Date();
  }

  if (isNaN(date.getTime())) {
    throw new Error('Invalid birth date/time provided. Please use YYYY-MM-DD and HH:MM');
  }

  const houseSystem = params.house_system || 'whole_sign';

  const time = new Astronomy.AstroTime(date);
  const timeNextHour = new Astronomy.AstroTime(new Date(date.getTime() + 3600000));

  // 1. Angles & Houses
  const angles = calculateAngles(date, lat, lon);
  const houses = calculateHouses(angles.asc, angles.mc, houseSystem);

  // 2. Planets
  const planets = {};

  for (const body of BODIES) {
    const vec = Astronomy.GeoVector(Astronomy.Body[body.key], time, true);
    const ecl = Astronomy.Ecliptic(vec);
    const degree = ecl.elon;

    // Check Retrograde Motion (compare with 1 hour later)
    const vecNext = Astronomy.GeoVector(Astronomy.Body[body.key], timeNextHour, true);
    const eclNext = Astronomy.Ecliptic(vecNext);
    let delta = eclNext.elon - degree;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const isRetrograde = delta < 0;

    const signIndex = Math.floor(degree / 30);
    const degInSign = degree % 30;
    const house = getHouseForDegree(degree, houses);

    planets[body.name] = {
      degree: parseFloat(degree.toFixed(4)),
      sign: ZODIAC_SIGNS[signIndex],
      sign_index: signIndex,
      degree_in_sign: parseFloat(degInSign.toFixed(4)),
      house,
      is_retrograde: isRetrograde
    };
  }

  // 3. North Node (Rahu)
  const nodeDeg = calculateNorthNode(date);
  const nodeSignIdx = Math.floor(nodeDeg / 30);
  planets['NorthNode'] = {
    degree: parseFloat(nodeDeg.toFixed(4)),
    sign: ZODIAC_SIGNS[nodeSignIdx],
    sign_index: nodeSignIdx,
    degree_in_sign: parseFloat((nodeDeg % 30).toFixed(4)),
    house: getHouseForDegree(nodeDeg, houses),
    is_retrograde: true // True/Mean node is virtually always retrograde
  };

  return {
    meta: {
      resolved_location: resolvedCity || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      timezone: tz,
      utc_time: date.toISOString(),
      latitude: lat,
      longitude: lon,
      house_system: houseSystem,
      sidereal_time_ramc: parseFloat(angles.ramc.toFixed(4)),
      obliquity: parseFloat(angles.obliquity.toFixed(4))
    },
    angles: {
      ascendant: parseFloat(angles.asc.toFixed(4)),
      midheaven: parseFloat(angles.mc.toFixed(4)),
      descendant: parseFloat(angles.dsc.toFixed(4)),
      imum_coeli: parseFloat(angles.ic.toFixed(4))
    },
    ascendant: angles.asc,
    houses,
    planets
  };
}

module.exports = {
  calculateNatalChart,
  calculateAngles,
  calculateHouses,
  ZODIAC_SIGNS
};

