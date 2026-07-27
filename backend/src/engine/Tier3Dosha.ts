import { IHoroscope } from '../models/HoroscopeModel';

export interface Tier3Result {
  balanced: boolean;
  warnings: string[];
}

export class Tier3Dosha {
  static execute(boy: IHoroscope, girl: IHoroscope): Tier3Result {
    const warnings: string[] = [];
    let balanced = true;

    // 1. Calculate Malefic Score if missing
    const boyScore = boy.malefic_score !== undefined ? boy.malefic_score : this.calculateMaleficScore(boy);
    const girlScore = girl.malefic_score !== undefined ? girl.malefic_score : this.calculateMaleficScore(girl);

    // Rule 1: Papasamyam (Dosha Samyam)
    // Kerala Rule: Groom's score must be >= Bride's score.
    const isDoshaBalanced = boyScore >= girlScore;
    if (!isDoshaBalanced) {
      warnings.push(`FAIL_PAPA_SAMYAM: Bride's malefic score (${girlScore}) exceeds Groom's score (${boyScore}).`);
      balanced = false;
    }

    // Rule 2: Kuja Dosha (Mars Dosha)
    const bKuja = Boolean(boy.kuja_dosha_status);
    const gKuja = Boolean(girl.kuja_dosha_status);

    if (bKuja !== gKuja) {
      warnings.push(`FAIL_KUJA_MISMATCH: Kuja Dosha mismatch. Boy: ${bKuja}, Girl: ${gKuja}`);
      balanced = false;
    }

    return {
      balanced,
      warnings
    };
  }

  private static calculateMaleficScore(horoscope: IHoroscope): number {
    if (!horoscope.planets || horoscope.planets.length === 0) {
      return 0; // Unable to calculate without positions
    }
    
    // In actual astrology, score depends on placement of Sun, Mars, Saturn, Rahu, Ketu from Lagna/Moon/Venus
    // Here we just return a mock score based on presence of planets to demonstrate the fallback execution
    let score = 0;
    const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
    horoscope.planets.forEach(p => {
      if (malefics.includes(p.planet)) score += 10;
    });
    return score;
  }
}
