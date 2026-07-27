import { IHoroscope } from '../models/HoroscopeModel';
import { Tier1Dealbreakers } from './Tier1Dealbreakers';
import { Tier2Porutham } from './Tier2Porutham';
import { Tier3Dosha } from './Tier3Dosha';
import { Tier4DasaSandhi } from './Tier4DasaSandhi';

import { PoruthamScore } from './Tier2Porutham';

export interface MatchResult {
  overall_status: 'REJECTED' | 'ACCEPTABLE' | 'EXCELLENT';
  porutham_score: number;
  dealbreakers_passed: boolean;
  dosha_balanced: boolean;
  warnings: string[];
  detailed_breakdown: Record<string, PoruthamScore | boolean>;
  boy_malefic_score?: number;
  girl_malefic_score?: number;
  boy_dasha?: { lord: string, years: number };
  girl_dasha?: { lord: string, years: number };
}

export class RuleEngine {
  private boy: IHoroscope;
  private girl: IHoroscope;
  
  constructor(boy: IHoroscope, girl: IHoroscope) {
    this.boy = boy;
    this.girl = girl;
  }

  public executeMatching(): MatchResult {
    let warnings: string[] = [];
    
    const baseResult = {
      boy_malefic_score: this.boy.malefic_score,
      girl_malefic_score: this.girl.malefic_score,
      boy_dasha: { lord: this.boy.dasha_balance_planet, years: this.boy.dasha_balance_years },
      girl_dasha: { lord: this.girl.dasha_balance_planet, years: this.girl.dasha_balance_years }
    };
    
    // Tier 1: Dealbreakers
    const tier1 = Tier1Dealbreakers.execute(this.boy, this.girl);
    
    if (!tier1.passed) {
      if (tier1.reason) warnings.push(tier1.reason);
      return {
        ...baseResult,
        overall_status: 'REJECTED',
        porutham_score: 0,
        dealbreakers_passed: false,
        dosha_balanced: false,
        warnings,
        detailed_breakdown: { Rajju: tier1.rajjuPassed, Vedha: tier1.vedhaPassed }
      };
    }

    // Tier 2: Porutham Scoring
    const tier2 = Tier2Porutham.execute(this.boy, this.girl, tier1);
    warnings = warnings.concat(tier2.warnings);

    if (tier2.score < 6) {
      warnings.push(`Low Porutham Score: ${tier2.score}/10. Minimum required is 6.`);
      return {
        ...baseResult,
        overall_status: 'REJECTED',
        porutham_score: tier2.score,
        dealbreakers_passed: true,
        dosha_balanced: false, // Halting before Dosha check
        warnings,
        detailed_breakdown: tier2.breakdown
      };
    }

    // Tier 3: Dosha Balancing
    const tier3 = Tier3Dosha.execute(this.boy, this.girl);
    warnings = warnings.concat(tier3.warnings);

    if (!tier3.balanced) {
      return {
        ...baseResult,
        overall_status: 'REJECTED',
        porutham_score: tier2.score,
        dealbreakers_passed: true,
        dosha_balanced: false,
        warnings,
        detailed_breakdown: tier2.breakdown
      };
    }

    // Tier 4: Dasa Sandhi
    const tier4 = Tier4DasaSandhi.execute(this.boy, this.girl);
    warnings = warnings.concat(tier4.warnings);

    let overall_status: 'ACCEPTABLE' | 'EXCELLENT' = 'ACCEPTABLE';
    if (tier2.score >= 8 && warnings.length === 0) {
      overall_status = 'EXCELLENT';
    }

    return {
      ...baseResult,
      overall_status,
      porutham_score: tier2.score,
      dealbreakers_passed: true,
      dosha_balanced: true,
      warnings,
      detailed_breakdown: tier2.breakdown
    };
  }
}
