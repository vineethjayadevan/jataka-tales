import { IHoroscope } from '../models/HoroscopeModel';
import { Nakshatras, NakshatraGanaMap, NakshatraYoniMap, YoniEnemyMap, RasiLordMap, PlanetaryFriendshipMap, VasyaMap } from './data/nakshatraData';
import { Tier1Result } from './Tier1Dealbreakers';

export type PoruthamScore = 'Uthama' | 'Madhyama' | 'Adhama';

export interface Tier2Result {
  score: number;
  breakdown: Record<string, PoruthamScore>;
  warnings: string[];
}

export class Tier2Porutham {
  static execute(boy: IHoroscope, girl: IHoroscope, tier1: Tier1Result): Tier2Result {
    const breakdown: Record<string, PoruthamScore> = {};
    const warnings: string[] = [];
    let score = 0;

    const bNak = boy.nakshatra;
    const gNak = girl.nakshatra;
    const bIndex = Nakshatras.indexOf(bNak);
    const gIndex = Nakshatras.indexOf(gNak);

    const bRasi = boy.rasi;
    const gRasi = girl.rasi;
    const RASI_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const bRasiIndex = RASI_NAMES.indexOf(bRasi);
    const gRasiIndex = RASI_NAMES.indexOf(gRasi);

    // Dina Porutham directional math: strictly count from Girl to Boy
    const starDistance = ((bIndex - gIndex + 27) % 27) + 1;

    let rasiDistance = (bRasiIndex - gRasiIndex) + 1;
    if (rasiDistance <= 0) rasiDistance += 12;

    // 1. Dina Porutham
    if (bNak === gNak) {
      if (boy.pada === girl.pada) {
        breakdown['Dina'] = 'Adhama';
        warnings.push("Eka Nakshatra with identical Padas is Adhama.");
      } else if (boy.pada > girl.pada) {
        breakdown['Dina'] = 'Uthama';
      } else {
        breakdown['Dina'] = 'Adhama';
      }
    } else {
      const remainder = starDistance % 9;
      if ([2, 4, 6, 8, 0].includes(remainder)) {
        breakdown['Dina'] = 'Uthama';
      } else if (remainder === 3) {
        breakdown['Dina'] = 'Madhyama';
      } else {
        breakdown['Dina'] = 'Adhama';
      }
    }

    // 2. Gana Porutham
    const bGana = NakshatraGanaMap[bNak];
    const gGana = NakshatraGanaMap[gNak];
    
    // Same Gana
    if (gGana === bGana) {
      breakdown['Gana'] = 'Uthama';
    } 
    // Cross Gana (Favorable)
    else if (gGana === 'Deva' && bGana === 'Manushya') {
      breakdown['Gana'] = 'Uthama';
    } 
    // Cross Gana (Moderate)
    else if (gGana === 'Manushya' && bGana === 'Deva') {
      breakdown['Gana'] = 'Madhyama';
    } 
    // Cross Gana (Clash - Reject)
    else if (gGana === 'Rakshasa' && (bGana === 'Deva' || bGana === 'Manushya')) {
      breakdown['Gana'] = 'Adhama';
    } 
    else if ((gGana === 'Deva' || gGana === 'Manushya') && bGana === 'Rakshasa') {
      breakdown['Gana'] = 'Adhama';
    } 
    else {
      breakdown['Gana'] = 'Adhama';
    }

    // 3. Yoni Porutham
    const bYoni = NakshatraYoniMap[bNak];
    const gYoni = NakshatraYoniMap[gNak];
    
    // Check for traditional predator/prey hostile pairs
    const isHostile = (y1: string, y2: string) => {
      const hostilePairs = [
        ['Lion', 'Elephant'], ['Lion', 'Sheep'], ['Lion', 'Cow'],
        ['Tiger', 'Cow'], ['Tiger', 'Sheep'],
        ['Mongoose', 'Serpent'],
        ['Horse', 'Buffalo'],
        ['Dog', 'Hare'],
        ['Cat', 'Rat'],
        ['Monkey', 'Sheep']
      ];
      return hostilePairs.some(p => p.includes(y1) && p.includes(y2));
    };

    if (bYoni === gYoni) {
      breakdown['Yoni'] = 'Uthama';
    } else if (YoniEnemyMap[bYoni] === gYoni || isHostile(bYoni, gYoni)) {
      breakdown['Yoni'] = 'Adhama';
    } else {
      breakdown['Yoni'] = 'Madhyama';
    }

    // 4. Rasi Porutham
    if (bRasi === gRasi) {
      breakdown['Rasi'] = bIndex > gIndex ? 'Uthama' : 'Adhama';
    } else if (rasiDistance === 6 || rasiDistance === 8) {
      breakdown['Rasi'] = 'Adhama'; // Shashtashtama
      warnings.push("Shashtashtama Dosha (6-8 Rasi distance).");
    } else if (rasiDistance >= 7) {
      breakdown['Rasi'] = 'Uthama';
    } else if (rasiDistance === 3 || rasiDistance === 4) {
      breakdown['Rasi'] = 'Madhyama';
    } else {
      breakdown['Rasi'] = 'Adhama';
    }

    // 5. Rasyadhipati Porutham
    const bLord = RasiLordMap[bRasi];
    const gLord = RasiLordMap[gRasi];
    if (bLord === gLord) {
      breakdown['Rasyadhipati'] = 'Uthama';
    } else {
      const bLordFriends = PlanetaryFriendshipMap[bLord]?.friends || [];
      const bLordEnemies = PlanetaryFriendshipMap[bLord]?.enemies || [];
      const gLordFriends = PlanetaryFriendshipMap[gLord]?.friends || [];
      const gLordEnemies = PlanetaryFriendshipMap[gLord]?.enemies || [];

      const bLikesG = bLordFriends.includes(gLord) ? 1 : (bLordEnemies.includes(gLord) ? -1 : 0);
      const gLikesB = gLordFriends.includes(bLord) ? 1 : (gLordEnemies.includes(bLord) ? -1 : 0);

      const relationSum = bLikesG + gLikesB;
      if (relationSum >= 1) breakdown['Rasyadhipati'] = 'Uthama';
      else if (relationSum === 0) breakdown['Rasyadhipati'] = 'Madhyama';
      else breakdown['Rasyadhipati'] = 'Adhama';
    }

    // 6. Rajju Porutham
    breakdown['Rajju'] = tier1.rajjuPassed ? 'Uthama' : 'Adhama';

    // 7. Vedha Porutham
    breakdown['Vedha'] = tier1.vedhaPassed ? 'Uthama' : 'Adhama';

    // 8. Vasya Porutham
    const bVasya = VasyaMap[bRasi] || [];
    const gVasya = VasyaMap[gRasi] || [];
    if (bVasya.includes(gRasi) && gVasya.includes(bRasi)) {
      breakdown['Vasya'] = 'Uthama';
    } else if (bVasya.includes(gRasi) || gVasya.includes(bRasi)) {
      breakdown['Vasya'] = 'Madhyama';
    } else {
      breakdown['Vasya'] = 'Adhama';
    }

    // 9. Mahendra Porutham
    const mahendraDistances = [4, 7, 10, 13, 16, 19, 22, 25];
    if (mahendraDistances.includes(starDistance)) {
      breakdown['Mahendra'] = 'Uthama';
    } else {
      breakdown['Mahendra'] = 'Adhama';
    }

    // 10. Stree Deergha Porutham
    if (starDistance > 15) {
      breakdown['StreeDeergam'] = 'Uthama';
    } else if (starDistance >= 9) {
      breakdown['StreeDeergam'] = 'Madhyama';
    } else {
      breakdown['StreeDeergam'] = 'Adhama';
    }

    // Sum Score
    for (const key in breakdown) {
      const val = breakdown[key];
      if (val === 'Uthama') score += 1;
      else if (val === 'Madhyama') score += 0.5;
    }

    return {
      score,
      breakdown,
      warnings
    };
  }
}
