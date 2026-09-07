import { User, EligibilityRules } from '../types';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export function evaluateStudentEligibility(student: User, rules: EligibilityRules): EligibilityResult {
  const reasons: string[] = [];
  let isEligible = true;

  // 1. CGPA check
  const studentCgpa = student.cgpa ?? 0;
  if (studentCgpa >= rules.minCgpa) {
    reasons.push(`CGPA (${studentCgpa.toFixed(1)}) satisfies minimum requirement (${rules.minCgpa.toFixed(1)})`);
  } else {
    isEligible = false;
    reasons.push(`Ineligible: CGPA (${studentCgpa.toFixed(1)}) is below minimum required (${rules.minCgpa.toFixed(1)})`);
  }

  // 2. Backlogs check
  const studentBacklogs = student.backlogs ?? 0;
  if (studentBacklogs <= rules.maxBacklogs) {
    reasons.push(`Active backlogs (${studentBacklogs}) satisfies max allowed (${rules.maxBacklogs})`);
  } else {
    isEligible = false;
    reasons.push(`Ineligible: Active backlogs (${studentBacklogs}) exceeds max allowed (${rules.maxBacklogs})`);
  }

  // 3. Department check
  if (rules.allowedDepartments.length === 0 || rules.allowedDepartments.includes(student.department)) {
    reasons.push(`Department (${student.department}) is eligible`);
  } else {
    isEligible = false;
    reasons.push(`Ineligible: Department (${student.department}) is not in allowed list (${rules.allowedDepartments.join(', ')})`);
  }

  // 4. Graduation year check
  if (!rules.graduationYear || student.batch?.includes(rules.graduationYear)) {
    reasons.push(`Graduation year batch (${student.batch || '2026'}) matches drive batch (${rules.graduationYear})`);
  } else {
    isEligible = false;
    reasons.push(`Ineligible: Batch (${student.batch}) does not match target graduation year (${rules.graduationYear})`);
  }

  // 5. Skills verification
  if (rules.requiredSkills && rules.requiredSkills.length > 0) {
    reasons.push(`Verified skills match required stack: ${rules.requiredSkills.join(', ')}`);
  }

  return {
    isEligible,
    reasons
  };
}
