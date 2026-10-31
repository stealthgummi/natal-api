/**
 * Offline Geocoding & Historical Timezone Database
 * Maps major global cities to exact coordinates and IANA timezones.
 * Allows developers to send simple city names instead of looking up lat/lon.
 */

const MAJOR_CITIES = [
  // US & Canada
  { city: 'New York', country: 'United States', state: 'NY', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { city: 'Los Angeles', country: 'United States', state: 'CA', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { city: 'Chicago', country: 'United States', state: 'IL', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
  { city: 'Houston', country: 'United States', state: 'TX', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
  { city: 'Phoenix', country: 'United States', state: 'AZ', lat: 33.4484, lon: -112.0740, tz: 'America/Phoenix' },
  { city: 'Philadelphia', country: 'United States', state: 'PA', lat: 39.9526, lon: -75.1652, tz: 'America/New_York' },
  { city: 'San Antonio', country: 'United States', state: 'TX', lat: 29.4241, lon: -98.4936, tz: 'America/Chicago' },
  { city: 'San Diego', country: 'United States', state: 'CA', lat: 32.7157, lon: -117.1611, tz: 'America/Los_Angeles' },
  { city: 'Dallas', country: 'United States', state: 'TX', lat: 32.7767, lon: -96.7970, tz: 'America/Chicago' },
  { city: 'San Francisco', country: 'United States', state: 'CA', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
  { city: 'Austin', country: 'United States', state: 'TX', lat: 30.2672, lon: -97.7431, tz: 'America/Chicago' },
  { city: 'Seattle', country: 'United States', state: 'WA', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
  { city: 'Denver', country: 'United States', state: 'CO', lat: 39.7392, lon: -104.9903, tz: 'America/Denver' },
  { city: 'Boston', country: 'United States', state: 'MA', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
  { city: 'Miami', country: 'United States', state: 'FL', lat: 25.7617, lon: -80.1918, tz: 'America/New_York' },
  { city: 'Cincinnati', country: 'United States', state: 'OH', lat: 39.1031, lon: -84.5120, tz: 'America/New_York' },
  { city: 'Atlanta', country: 'United States', state: 'GA', lat: 33.7490, lon: -84.3880, tz: 'America/New_York' },
  { city: 'Las Vegas', country: 'United States', state: 'NV', lat: 36.1699, lon: -115.1398, tz: 'America/Los_Angeles' },
  { city: 'Detroit', country: 'United States', state: 'MI', lat: 42.3314, lon: -83.0458, tz: 'America/Detroit' },
  { city: 'Minneapolis', country: 'United States', state: 'MN', lat: 44.9778, lon: -93.2650, tz: 'America/Chicago' },
  { city: 'Portland', country: 'United States', state: 'OR', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles' },
  { city: 'Toronto', country: 'Canada', state: 'ON', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
  { city: 'Montreal', country: 'Canada', state: 'QC', lat: 45.5017, lon: -73.5673, tz: 'America/Toronto' },
  { city: 'Vancouver', country: 'Canada', state: 'BC', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },

  // Europe & UK
  { city: 'London', country: 'United Kingdom', state: 'England', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { city: 'Paris', country: 'France', state: '', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { city: 'Berlin', country: 'Germany', state: '', lat: 52.5200, lon: 13.4050, tz: 'Europe/Berlin' },
  { city: 'Rome', country: 'Italy', state: '', lat: 41.9028, lon: 12.4964, tz: 'Europe/Rome' },
  { city: 'Madrid', country: 'Spain', state: '', lat: 40.4168, lon: -3.7038, tz: 'Europe/Madrid' },
  { city: 'Barcelona', country: 'Spain', state: '', lat: 41.3879, lon: 2.1699, tz: 'Europe/Madrid' },
  { city: 'Amsterdam', country: 'Netherlands', state: '', lat: 52.3676, lon: 4.9041, tz: 'Europe/Amsterdam' },
  { city: 'Dublin', country: 'Ireland', state: '', lat: 53.3498, lon: -6.2603, tz: 'Europe/Dublin' },
  { city: 'Vienna', country: 'Austria', state: '', lat: 48.2082, lon: 16.3738, tz: 'Europe/Vienna' },
  { city: 'Zurich', country: 'Switzerland', state: '', lat: 47.3769, lon: 8.5417, tz: 'Europe/Zurich' },
  { city: 'Athens', country: 'Greece', state: '', lat: 37.9838, lon: 23.7275, tz: 'Europe/Athens' },

  // Latin America
  { city: 'Mexico City', country: 'Mexico', state: '', lat: 19.4326, lon: -99.1332, tz: 'America/Mexico_City' },
  { city: 'Sao Paulo', country: 'Brazil', state: '', lat: -23.5505, lon: -46.6333, tz: 'America/Sao_Paulo' },
  { city: 'Rio de Janeiro', country: 'Brazil', state: '', lat: -22.9068, lon: -43.1729, tz: 'America/Sao_Paulo' },
  { city: 'Buenos Aires', country: 'Argentina', state: '', lat: -34.6037, lon: -58.3816, tz: 'America/Argentina/Buenos_Aires' },
  { city: 'Bogota', country: 'Colombia', state: '', lat: 4.7110, lon: -74.0721, tz: 'America/Bogota' },
  { city: 'Lima', country: 'Peru', state: '', lat: -12.0464, lon: -77.0428, tz: 'America/Lima' },

  // Asia & Middle East
  { city: 'Tokyo', country: 'Japan', state: '', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { city: 'Seoul', country: 'South Korea', state: '', lat: 37.5665, lon: 126.9780, tz: 'Asia/Seoul' },
  { city: 'Singapore', country: 'Singapore', state: '', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { city: 'Dubai', country: 'United Arab Emirates', state: '', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
  { city: 'Mumbai', country: 'India', state: '', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { city: 'New Delhi', country: 'India', state: '', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
  { city: 'Bangkok', country: 'Thailand', state: '', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
  { city: 'Hong Kong', country: 'Hong Kong', state: '', lat: 22.3193, lon: 114.1694, tz: 'Asia/Hong_Kong' },

  // Australia & Oceania
  { city: 'Sydney', country: 'Australia', state: 'NSW', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { city: 'Melbourne', country: 'Australia', state: 'VIC', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne' },
  { city: 'Auckland', country: 'New Zealand', state: '', lat: -36.8485, lon: 174.7633, tz: 'Pacific/Auckland' }
];

/**
 * Fuzzy search a city name
 */
function findCity(query) {
  if (!query || typeof query !== 'string') return null;
  const q = query.trim().toLowerCase();

  // Exact match
  const exact = MAJOR_CITIES.find(c => c.city.toLowerCase() === q);
  if (exact) return exact;

  // Starts with
  const starts = MAJOR_CITIES.find(c => c.city.toLowerCase().startsWith(q));
  if (starts) return starts;

  // Contains
  const contains = MAJOR_CITIES.find(c => 
    c.city.toLowerCase().includes(q) || 
    (c.state && c.state.toLowerCase() === q) ||
    c.country.toLowerCase().includes(q)
  );
  return contains || null;
}

/**
 * Converts Local Birth Date + Time + IANA Timezone into accurate historical UTC Date.
 * Automatically accounts for historical Daylight Saving Time (DST) shifts.
 */
function localTimeToUtc(dateStr, timeStr, timeZone = 'UTC') {
  if (!timeZone || timeZone === 'UTC') {
    return new Date(`${dateStr}T${timeStr || '12:00:00'}Z`);
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = (timeStr || '12:00').split(':').map(Number);

  // Baseline UTC date
  const tempUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Determine timezone offset using native IANA database
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });

  const parts = dtf.formatToParts(tempUtc);
  const p = {};
  parts.forEach(({ type, value }) => { p[type] = value; });

  const localInTz = new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour === '24' ? 0 : p.hour, p.minute, p.second));
  const diffMs = tempUtc.getTime() - localInTz.getTime();
  const trueUtc = new Date(tempUtc.getTime() + diffMs);

  return trueUtc;
}

module.exports = {
  MAJOR_CITIES,
  findCity,
  localTimeToUtc
};

