import { IHoroscope } from '../models/HoroscopeModel';
import { NakshatraRajjuMap, NakshatraVedhaMap } from './data/nakshatraData';

export interface Tier1Result {
  passed: boolean;
  rajjuPassed: boolean;
  vedhaPassed: boolean;
  reason?: string;
}

export class Tier1Dealbreakers {
  static execute(boy: IHoroscope, girl: IHoroscope): Tier1Result {
    const bNak = boy.nakshatra;
    const gNak = girl.nakshatra;

    // 1. Rajju Check
    const bRajju = NakshatraRajjuMap[bNak];
    const gRajju = NakshatraRajjuMap[gNak];

    if (bRajju && gRajju && bRajju === gRajju) {
      return {
        passed: false,
        rajjuPassed: false,
        vedhaPassed: true, // Didn't fail Vedha yet
        reason: `FAIL_MATCH: Both Nakshatras (${bNak}, ${gNak}) belong to the same Rajju (${bRajju}).`
      };
    }

    // 2. Vedha Check
    const bVedhaList = NakshatraVedhaMap[bNak] || [];
    if (bVedhaList.includes(gNak)) {
      return {
        passed: false,
        rajjuPassed: true,
        vedhaPassed: false,
        reason: `FAIL_MATCH: Mutual Vedha (obstruction) between ${bNak} and ${gNak}.`
      };
    }

    return {
      passed: true,
      rajjuPassed: true,
      vedhaPassed: true
    };
  }
}
