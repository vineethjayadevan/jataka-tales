export interface RuleExplanation {
  ruleName: string;
  inputData: any;
  calculation: string;
  interpretation: string;
  confidence: number;
}
