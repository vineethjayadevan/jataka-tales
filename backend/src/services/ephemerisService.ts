import { Body, GeoVector, Ecliptic, MakeTime, SiderealTime } from 'astronomy-engine';

export const NAKSHATRA_NAMES = [
  "Aswini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Aslesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const RASI_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_LENGTHS: Record<string, number> = {
  'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17
};

export interface HoroscopeData {
  gender: 'M'|'F';
  nakshatra: string;
  pada: number;
  rasi: string;
  lagna: string;
  dasha_balance_planet: string;
  dasha_balance_years: number;
  malefic_score: number;
  kuja_dosha_status: boolean;
  planets: { planet: string, degree: number }[];
}

export const generateHoroscope = (
  gender: 'M'|'F',
  date: Date, 
  lat: number, 
  lng: number,
  manualNakshatra?: string
): HoroscopeData => {
  
  const astroDate = MakeTime(date);
  
  // 1. Precise Lahiri Ayanamsa Calculation (Chitra Paksha)
  // In astronomy-engine, astroDate.tt is ALREADY the number of days since J2000.
  const t = astroDate.tt / 36525.0; // Julian centuries since J2000
  // Standard Lahiri approximation (23°51'11" at J2000)
  const ayanamsa = 23.853056 + (1.39604 * t); 

  // Helper to calculate Sidereal Longitude
  const getSidereal = (body: any) => {
    // astronomy-engine Ecliptic requires a GeoVector
    const geocentric = GeoVector(body, astroDate, true);
    const tropical = Ecliptic(geocentric).elon;
    return (tropical - ayanamsa + 360) % 360;
  };

  // 2. Planets
  const siderealMoon = getSidereal(Body.Moon);
  const siderealSun = getSidereal(Body.Sun);
  const siderealMars = getSidereal(Body.Mars);
  const siderealVenus = getSidereal(Body.Venus);
  const siderealSaturn = getSidereal(Body.Saturn);

  // Mean Rahu Calculation (Lunar Ascending Node)
  const d = astroDate.tt; // astronomy-engine tt is days since J2000
  let tropicalRahu = (125.04452 - 0.0529537648 * d) % 360;
  if (tropicalRahu < 0) tropicalRahu += 360;
  const siderealRahu = (tropicalRahu - ayanamsa + 360) % 360;
  const siderealKetu = (siderealRahu + 180) % 360;

  // 3. Ascendant (Lagna) via Spherical Trigonometry
  const gst = SiderealTime(astroDate); // Greenwich Sidereal Time in hours
  let lst = gst + (lng / 15.0); // Local Sidereal Time in hours
  if (lst < 0) lst += 24;
  if (lst >= 24) lst -= 24;

  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;
  const e = 23.4392911 * rad; // Obliquity of the ecliptic
  const lstRad = (lst * 15.0) * rad;
  const latRad = lat * rad;

  let tropicalAscRad = Math.atan2(Math.cos(lstRad), -Math.sin(lstRad) * Math.cos(e) - Math.tan(latRad) * Math.sin(e));
  let tropicalAsc = tropicalAscRad * deg;
  if (tropicalAsc < 0) tropicalAsc += 360;
  
  const siderealAsc = (tropicalAsc - ayanamsa + 360) % 360;
  const lagnaIndex = Math.floor(siderealAsc / 30);
  const lagna = RASI_NAMES[lagnaIndex];

  // 4. Moon details (Nakshatra, Pada, Rasi)
  const NAK_SPAN = 360 / 27;
  const PADA_SPAN = NAK_SPAN / 4;
  
  const nakIndex = Math.floor(siderealMoon / NAK_SPAN);
  const calculatedNakshatra = NAKSHATRA_NAMES[nakIndex];
  
  const degreeInNak = siderealMoon % NAK_SPAN;
  const pada = Math.floor(degreeInNak / PADA_SPAN) + 1;
  
  const moonRasiIndex = Math.floor(siderealMoon / 30);
  const rasi = RASI_NAMES[moonRasiIndex];
  const venusRasiIndex = Math.floor(siderealVenus / 30);

  // 5. Dasha Balance
  const fractionRemaining = 1.0 - (degreeInNak / NAK_SPAN);
  const dashaLord = DASHA_LORDS[nakIndex % 9];
  const dashaTotalYears = DASHA_LENGTHS[dashaLord];
  const dasha_balance_years = parseFloat((fractionRemaining * dashaTotalYears).toFixed(3));

  // 6. Kerala Kuja Dosha (Mars from Lagna, Moon, Venus)
  const marsRasiIndex = Math.floor(siderealMars / 30);
  const getHouseDistance = (planetRasi: number, referenceRasi: number) => (planetRasi - referenceRasi + 12) % 12 + 1;
  
  const marsFromLagna = getHouseDistance(marsRasiIndex, lagnaIndex);
  const marsFromMoon = getHouseDistance(marsRasiIndex, moonRasiIndex);
  const marsFromVenus = getHouseDistance(marsRasiIndex, venusRasiIndex);

  const doshaHouses = [2, 4, 7, 8, 12];
  const kuja_dosha_status = doshaHouses.includes(marsFromLagna) || 
                            doshaHouses.includes(marsFromMoon) || 
                            doshaHouses.includes(marsFromVenus);

  // 7. Papasamyam (Dosha Samyam) Scoring
  let malefic_score = 0;
  
  const getHouseScore = (house: number) => {
    if (house === 8) return 4;
    if (house === 7) return 3;
    if (house === 2 || house === 4 || house === 12) return 2;
    if (house === 1) return 1;
    return 0;
  };

  const malefics = [
    { name: 'Sun', rasiIndex: Math.floor(siderealSun / 30), weight: 0.5 },
    { name: 'Mars', rasiIndex: marsRasiIndex, weight: 1.0 },
    { name: 'Saturn', rasiIndex: Math.floor(siderealSaturn / 30), weight: 0.75 },
    { name: 'Rahu', rasiIndex: Math.floor(siderealRahu / 30), weight: 0.5 },
    { name: 'Ketu', rasiIndex: Math.floor(siderealKetu / 30), weight: 0.5 },
  ];

  const references = [lagnaIndex, moonRasiIndex, venusRasiIndex];

  for (const malefic of malefics) {
    for (const ref of references) {
      const house = getHouseDistance(malefic.rasiIndex, ref);
      malefic_score += getHouseScore(house) * malefic.weight;
    }
  }

  const planets = [
    { planet: 'Sun', degree: siderealSun },
    { planet: 'Moon', degree: siderealMoon },
    { planet: 'Mars', degree: siderealMars },
    { planet: 'Mercury', degree: getSidereal(Body.Mercury) },
    { planet: 'Jupiter', degree: getSidereal(Body.Jupiter) },
    { planet: 'Venus', degree: siderealVenus },
    { planet: 'Saturn', degree: siderealSaturn },
    { planet: 'Rahu', degree: siderealRahu },
    { planet: 'Ketu', degree: siderealKetu }
  ];

  return {
    gender,
    nakshatra: manualNakshatra || calculatedNakshatra,
    pada,
    rasi,
    lagna,
    dasha_balance_planet: dashaLord,
    dasha_balance_years,
    malefic_score,
    kuja_dosha_status,
    planets
  };
};
