import { IHoroscope } from '../models/HoroscopeModel';
import { DashaLengths } from './data/nakshatraData';

export interface Tier4Result {
  warnings: string[];
}

export class Tier4DasaSandhi {
  static execute(boy: IHoroscope, girl: IHoroscope): Tier4Result {
    const warnings: string[] = [];

    // Assuming we calculate transitions up to 80 years of age
    const maxAge = 80;

    const bTransitions = this.calculateTransitions(boy.dasha_balance_planet, boy.dasha_balance_years, maxAge);
    const gTransitions = this.calculateTransitions(girl.dasha_balance_planet, girl.dasha_balance_years, maxAge);

    // Check for collisions within 1.0 years (365 days)
    for (const bTime of bTransitions) {
      for (const gTime of gTransitions) {
        const diff = Math.abs(bTime - gTime);
        if (diff <= 1.0) {
          warnings.push(`WARNING_DASA_SANDHI: Transition collision at approx age ${bTime.toFixed(1)} (Diff: ${diff.toFixed(2)} years)`);
        }
      }
    }

    return { warnings };
  }

  private static calculateTransitions(startPlanet: string, balanceYears: number, maxAge: number): number[] {
    const transitions: number[] = [];
    const sequence = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    
    let currentAge = balanceYears;
    transitions.push(currentAge); // First transition

    let idx = sequence.indexOf(startPlanet);
    if (idx === -1) idx = 0; // fallback

    // Move to next planet in sequence
    idx = (idx + 1) % sequence.length;

    while (currentAge < maxAge) {
      const planet = sequence[idx];
      const length = DashaLengths[planet] || 10;
      currentAge += length;
      
      if (currentAge <= maxAge) {
        transitions.push(currentAge);
      }
      
      idx = (idx + 1) % sequence.length;
    }

    return transitions;
  }
}
