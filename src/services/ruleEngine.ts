import { Rule, SeverityLevel } from '../types';

export interface MatchResult {
  rule: Rule | null;
  condition: string;
  conditionBn?: string;
  specialist: string;
  specialistBn?: string;
  severity: SeverityLevel;
  confidence: number;
  healthTips: string[];
  matchedSymptoms: string[];
  isFallback: boolean;
}

/**
 * Normalizes symptom strings to lowercase trimmed keys
 */
export function normalizeSymptom(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * Executes rule-based matching over active rules
 * Implements SRS §3.1.2 / FR-6, FR-7, FR-8, FR-9 & System Design §3
 */
export function matchSymptomRule(
  selectedSymptoms: string[],
  activeRules: Rule[]
): MatchResult {
  const normalizedInputs = Array.from(
    new Set(selectedSymptoms.map(normalizeSymptom))
  );

  if (normalizedInputs.length === 0) {
    return {
      rule: null,
      condition: 'No Symptoms Selected',
      specialist: 'General Physician',
      severity: 'low',
      confidence: 0,
      healthTips: ['Please select one or more symptoms to analyze.'],
      matchedSymptoms: [],
      isFallback: true
    };
  }

  const enabledRules = activeRules.filter((r) => r.active);

  let bestRule: Rule | null = null;
  let bestScore = -1;
  let bestMatchedSymptoms: string[] = [];

  for (const rule of enabledRules) {
    const ruleSymptoms = rule.symptoms.map(normalizeSymptom);
    
    // Count how many of rule's symptoms are present in the user's input
    const matched = ruleSymptoms.filter((rs) => normalizedInputs.includes(rs));
    const matchCount = matched.length;

    if (matchCount > 0) {
      // Calculate Jaccard similarity & coverage score
      const coverage = matchCount / ruleSymptoms.length; // How well the rule is covered
      const precision = matchCount / normalizedInputs.length; // How well the input fits
      
      // Calculate weighted score (coverage has higher weight)
      const baseConfidence = rule.confidenceBase || 85;
      const combinedScore = (coverage * 0.7 + precision * 0.3) * baseConfidence;

      // Bonus if exact match or 100% rule coverage
      const finalScore = coverage === 1 ? Math.min(99, combinedScore + 10) : combinedScore;

      if (finalScore > bestScore && coverage >= 0.5) {
        bestScore = finalScore;
        bestRule = rule;
        bestMatchedSymptoms = matched;
      }
    }
  }

  if (bestRule) {
    return {
      rule: bestRule,
      condition: bestRule.condition,
      conditionBn: bestRule.conditionBn,
      specialist: bestRule.specialist,
      specialistBn: bestRule.specialistBn,
      severity: bestRule.severity,
      confidence: Math.round(Math.min(98, Math.max(70, bestScore))),
      healthTips: bestRule.tips || [
        'Maintain hydration and track temperature.',
        'Consult with a certified physician if symptoms persist beyond 48 hours.'
      ],
      matchedSymptoms: bestMatchedSymptoms,
      isFallback: false
    };
  }

  // Fallback if no specific rule matches (SRS §3.1.2 / System Design §3)
  // Any single high-risk neuro/cardiac/respiratory symptom must never fall
  // through as "low" urgency.
  const urgentKeys = [
    'chest_pain',
    'shortness_of_breath',
    'confusion',
    'blurred_vision',
    'numbness',
    'palpitations',
    'swollen_ankles',
    'dizziness',
    'wheezing'
  ];
  const isUrgentContext = normalizedInputs.some(s =>
    urgentKeys.some((k) => s.includes(k))
  );

  return {
    rule: null,
    condition: 'General Undifferentiated Symptoms',
    conditionBn: 'সাধারণ অনির্দিষ্ট লক্ষণাবলী',
    specialist: 'General Physician',
    specialistBn: 'মেডিসিন বিশেষজ্ঞ (General Physician)',
    severity: isUrgentContext ? 'urgent' : 'low',
    confidence: 65,
    healthTips: [
      'Your combination of symptoms warrants clinical examination by a General Physician.',
      'Keep a log of when symptoms worsen or subside.',
      'Seek emergency care immediately if experiencing severe chest pain, sudden difficulty breathing, or acute confusion.'
    ],
    matchedSymptoms: normalizedInputs,
    isFallback: true
  };
}

// TODO: refine specialist mapping logic

// TODO: test severity scores
