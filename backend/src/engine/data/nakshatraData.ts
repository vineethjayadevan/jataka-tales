// List of 27 Nakshatras for normalization
export const Nakshatras = [
  'Aswini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

// Rajju Map
export const NakshatraRajjuMap: Record<string, string> = {
  'Aswini': 'Padha', 'Magha': 'Padha', 'Mula': 'Padha',
  'Aslesha': 'Padha', 'Jyeshtha': 'Padha', 'Revati': 'Padha', // Typically grouped in Padha
  'Bharani': 'Kati', 'Purva Phalguni': 'Kati', 'Purva Ashadha': 'Kati',
  'Pushya': 'Kati', 'Anuradha': 'Kati', 'Uttara Bhadrapada': 'Kati',
  'Krittika': 'Nabhi', 'Uttara Phalguni': 'Nabhi', 'Uttara Ashadha': 'Nabhi',
  'Punarvasu': 'Nabhi', 'Vishakha': 'Nabhi', 'Purva Bhadrapada': 'Nabhi',
  'Rohini': 'Kanta', 'Hasta': 'Kanta', 'Shravana': 'Kanta',
  'Ardra': 'Kanta', 'Swati': 'Kanta', 'Shatabhisha': 'Kanta',
  'Mrigashira': 'Siras', 'Chitra': 'Siras', 'Dhanishta': 'Siras'
};

// Vedha Mutually Exclusive Map (Pairs that cannot marry)
export const NakshatraVedhaMap: Record<string, string[]> = {
  'Aswini': ['Jyeshtha'],
  'Bharani': ['Anuradha'],
  'Krittika': ['Vishakha'],
  'Rohini': ['Swati'],
  'Ardra': ['Shravana'],
  'Punarvasu': ['Uttara Ashadha'],
  'Pushya': ['Purva Ashadha'],
  'Aslesha': ['Mula'],
  'Magha': ['Revati'],
  'Purva Phalguni': ['Uttara Bhadrapada'],
  'Uttara Phalguni': ['Purva Bhadrapada'],
  'Hasta': ['Shatabhisha'],
  'Mrigashira': ['Dhanishta', 'Chitra'],
  // Bidirectional linking
  'Jyeshtha': ['Aswini'],
  'Anuradha': ['Bharani'],
  'Vishakha': ['Krittika'],
  'Swati': ['Rohini'],
  'Shravana': ['Ardra'],
  'Uttara Ashadha': ['Punarvasu'],
  'Purva Ashadha': ['Pushya'],
  'Mula': ['Aslesha'],
  'Revati': ['Magha'],
  'Uttara Bhadrapada': ['Purva Phalguni'],
  'Purva Bhadrapada': ['Uttara Phalguni'],
  'Shatabhisha': ['Hasta'],
  'Dhanishta': ['Mrigashira'],
  'Chitra': ['Mrigashira']
};

export const NakshatraGanaMap: Record<string, string> = {
  'Aswini': 'Deva', 'Mrigashira': 'Deva', 'Punarvasu': 'Deva', 'Pushya': 'Deva', 'Hasta': 'Deva', 'Swati': 'Deva', 'Anuradha': 'Deva', 'Shravana': 'Deva', 'Revati': 'Deva',
  'Bharani': 'Manushya', 'Rohini': 'Manushya', 'Ardra': 'Manushya', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya', 'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya',
  'Krittika': 'Rakshasa', 'Aslesha': 'Rakshasa', 'Magha': 'Rakshasa', 'Chitra': 'Rakshasa', 'Vishakha': 'Rakshasa', 'Jyeshtha': 'Rakshasa', 'Mula': 'Rakshasa', 'Dhanishta': 'Rakshasa', 'Shatabhisha': 'Rakshasa'
};

export const NakshatraYoniMap: Record<string, string> = {
  'Aswini': 'Horse', 'Shatabhisha': 'Horse',
  'Bharani': 'Elephant', 'Revati': 'Elephant',
  'Krittika': 'Sheep', 'Pushya': 'Sheep',
  'Rohini': 'Serpent', 'Mrigashira': 'Serpent',
  'Mula': 'Dog', 'Ardra': 'Dog',
  'Aslesha': 'Cat', 'Punarvasu': 'Cat',
  'Magha': 'Rat', 'Purva Phalguni': 'Rat',
  'Uttara Phalguni': 'Cow', 'Uttara Bhadrapada': 'Cow',
  'Swati': 'Buffalo', 'Hasta': 'Buffalo',
  'Vishakha': 'Tiger', 'Chitra': 'Tiger',
  'Jyeshtha': 'Hare', 'Anuradha': 'Hare',
  'Purva Ashadha': 'Monkey', 'Shravana': 'Monkey',
  'Uttara Ashadha': 'Mongoose',
  'Dhanishta': 'Lion', 'Purva Bhadrapada': 'Lion'
};

export const DashaLengths: Record<string, number> = {
  'Ketu': 7,
  'Venus': 20,
  'Sun': 6,
  'Moon': 10,
  'Mars': 7,
  'Rahu': 18,
  'Jupiter': 16,
  'Saturn': 19,
  'Mercury': 17
};

export const YoniEnemyMap: Record<string, string> = {
  'Horse': 'Buffalo', 'Buffalo': 'Horse',
  'Elephant': 'Lion', 'Lion': 'Elephant',
  'Sheep': 'Monkey', 'Monkey': 'Sheep',
  'Serpent': 'Mongoose', 'Mongoose': 'Serpent',
  'Dog': 'Hare', 'Hare': 'Dog',
  'Cat': 'Rat', 'Rat': 'Cat',
  'Cow': 'Tiger', 'Tiger': 'Cow'
};

export const RasiLordMap: Record<string, string> = {
  'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
  'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
  'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
};

export const PlanetaryFriendshipMap: Record<string, { friends: string[], enemies: string[] }> = {
  'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
  'Moon': { friends: ['Sun', 'Mercury'], enemies: [] },
  'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  'Mercury': { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  'Venus': { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  'Saturn': { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] }
};

export const VasyaMap: Record<string, string[]> = {
  'Aries': ['Leo', 'Scorpio'], 'Taurus': ['Cancer', 'Libra'], 'Gemini': ['Virgo'],
  'Cancer': ['Scorpio', 'Sagittarius'], 'Leo': ['Libra'], 'Virgo': ['Gemini', 'Pisces'],
  'Libra': ['Capricorn', 'Virgo'], 'Scorpio': ['Cancer'], 'Sagittarius': ['Pisces'],
  'Capricorn': ['Aries', 'Aquarius'], 'Aquarius': ['Aries'], 'Pisces': ['Capricorn']
};
