import { IHoroscope } from '../models/HoroscopeModel';
import { RuleEngine, MatchResult } from './RuleEngine';
import { generateHoroscope } from '../services/ephemerisService';

export interface SimulatedTimeResult {
  time: string;
  score: number;
  dosha_balanced: boolean;
  overall_status: string;
  boy_lagna?: string;
  boy_nakshatra?: string;
}

export class SimulationEngine {
  public static simulateAuspiciousTimes(
    dob: string,
    lat: number,
    lng: number,
    girl: IHoroscope
  ): SimulatedTimeResult[] {
    const validTimes: SimulatedTimeResult[] = [];

    // Loop through 24 hours in 15-minute increments
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hh = hour.toString().padStart(2, '0');
        const mm = minute.toString().padStart(2, '0');
        const timeStr = `${hh}:${mm}:00`;

        try {
          const dateTimeString = `${dob}T${timeStr}+05:30`;
          const dateObj = new Date(dateTimeString);

          // 1. Generate the Boy's chart for this specific minute
          const boyChart = generateHoroscope('M', dateObj, lat, lng);

          // 2. Run the matching engine
          const engine = new RuleEngine(boyChart as IHoroscope, girl);
          const result: MatchResult = engine.executeMatching();

          // 3. Validation Check
          if (result.dealbreakers_passed && result.dosha_balanced && result.porutham_score >= 6) {
            validTimes.push({
              time: timeStr,
              score: result.porutham_score,
              dosha_balanced: result.dosha_balanced,
              overall_status: result.overall_status,
              boy_lagna: boyChart.lagna,
              boy_nakshatra: boyChart.nakshatra
            });
          }
        } catch (error) {
          console.error(`Simulation failed at time ${timeStr}:`, error);
        }
      }
    }

    return validTimes;
  }
}
