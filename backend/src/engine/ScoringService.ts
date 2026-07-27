import { RuleExplanation } from '../types/Explanation';

export class ScoringService {
  public static calculateFinalScore(explanations: RuleExplanation[]): { score: number; classification: string } {
    let totalScore = 0;
    let maxScore = explanations.length * 10; // Assuming each rule is out of 10 for simplicity
    
    for (const exp of explanations) {
      const match = exp.interpretation.match(/Score:\s*(\d+)/i);
      if (match) {
        totalScore += parseInt(match[1], 10);
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    let classification = "Not Recommended";

    if (percentage >= 80) classification = "Excellent";
    else if (percentage >= 70) classification = "Very Good";
    else if (percentage >= 60) classification = "Good";
    else if (percentage >= 50) classification = "Average";
    else if (percentage >= 40) classification = "Needs Care";

    return {
      score: percentage,
      classification
    };
  }
}
