import { IHoroscope } from '../../models/HoroscopeModel';
import { RuleExplanation } from '../../types/Explanation';

// A mock simple dina porutham logic
export function calculateDinaPorutham(boy: IHoroscope, girl: IHoroscope): RuleExplanation {
  // In real Kerala astrology, it's based on counting from girl's nakshatra to boy's nakshatra
  // 1 to 27.
  const nakshatras = [
    'Aswini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
    'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
    'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
    'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati'
  ];

  const bIndex = nakshatras.findIndex(n => n.toLowerCase() === boy.nakshatra.toLowerCase());
  const gIndex = nakshatras.findIndex(n => n.toLowerCase() === girl.nakshatra.toLowerCase());

  let score = 0;
  let calculation = "Nakshatras not found in standard list.";
  let resultStr = "Fail";

  if (bIndex !== -1 && gIndex !== -1) {
    let distance = (bIndex - gIndex) + 1;
    if (distance <= 0) distance += 27;

    const remainder = distance % 9;
    
    // Favorable remainders: 2, 4, 6, 8, 9(0)
    if ([2, 4, 6, 8, 0].includes(remainder)) {
      score = 10;
      resultStr = "Pass";
    } else {
      score = 0;
      resultStr = "Fail";
    }
    calculation = `Distance from ${girl.nakshatra} to ${boy.nakshatra} is ${distance}. ${distance} % 9 = ${remainder}.`;
  }

  return {
    ruleName: 'Dina Porutham',
    inputData: { boyNakshatra: boy.nakshatra, girlNakshatra: girl.nakshatra },
    calculation,
    interpretation: `Score: ${score}/10. ${resultStr}. Favorable remainders are 2, 4, 6, 8, 0.`,
    confidence: 100
  };
}
