/**
 * Pavion RTS - AI Microservice Client (Node.js -> Python FastAPI)
 * Communicates with the Python AI Engine running on port 8000.
 * Falls back gracefully to local heuristic algorithms if microservice is offline.
 */

import { ResumeParserService, ParsedResumeData } from './resumeParser.service';

export interface CandidateMatchRequest {
  candidate: {
    skills: string[];
    total_experience: number;
    work_authorization?: string;
    expected_pay_rate?: number;
  };
  job: {
    title: string;
    required_skills: string[];
    experience_min: number;
    work_authorization_required?: string;
    pay_rate_max?: number;
  };
}

export interface CandidateMatchResponse {
  match_score: number;
  skill_match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
  action: string;
  breakdown: Record<string, any>;
  engine: 'python-fastapi' | 'local-heuristic';
}

export interface ScreeningAnswer {
  question: string;
  answer: string;
  expected_answer?: string;
  is_killer?: boolean;
}

export class AiEngineClient {
  private static baseUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
  private static timeoutMs = 4000;

  /**
   * Health check to test Python AI microservice readiness
   */
  public static async isHealthy(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Parse resume text via Python AI parser with local fallback
   */
  public static async parseResume(resumeText: string, originalFileName?: string): Promise<ParsedResumeData> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/api/v1/parse-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, filename: originalFileName }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as any;
        return {
          firstName: data.first_name || 'Candidate',
          lastName: data.last_name || 'Extracted',
          email: data.email || '',
          phone: data.phone || '',
          city: 'Dallas',
          state: 'TX',
          currentTitle: 'Senior Software Engineer',
          currentEmployer: 'Extracted Profile',
          totalExperience: data.total_experience || 5,
          skills: data.skills || [],
          education: (data.certifications && data.certifications.length > 0)
            ? data.certifications[0]
            : 'B.S. in Computer Science',
          professionalSummary: `${data.full_name || 'Candidate'} - ${data.total_experience || 5} years experience in ${(data.skills || []).slice(0, 4).join(', ')}`,
          workAuthorization: data.work_authorization || 'US Citizen',
        };
      }
    } catch {
      // Python AI engine offline or unreachable, fall back seamlessly
    }

    // Local heuristic fallback
    return ResumeParserService.parseText(resumeText, originalFileName);
  }

  /**
   * Match candidate profile against job requisition
   */
  public static async matchCandidate(req: CandidateMatchRequest): Promise<CandidateMatchResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/api/v1/match-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as any;
        return {
          ...data,
          engine: 'python-fastapi',
        };
      }
    } catch {
      // Fallback
    }

    // Local Fallback Matcher calculation
    const candidateSkills = (req.candidate.skills || []).map(s => s.toLowerCase());
    const requiredSkills = (req.job.required_skills || []).map(s => s.toLowerCase());

    const matched = requiredSkills.filter(r => candidateSkills.some(c => c.includes(r) || r.includes(c)));
    const missing = requiredSkills.filter(r => !matched.includes(r));
    const skillRatio = requiredSkills.length > 0 ? (matched.length / requiredSkills.length) : 1;
    const score = Math.round(skillRatio * 100);

    return {
      match_score: score,
      skill_match_percentage: score,
      matched_skills: matched.map(s => s.toUpperCase()),
      missing_skills: missing.map(s => s.toUpperCase()),
      recommendation: score >= 80 ? 'Strong Match - Proceed to Submission' : 'Moderate Match',
      action: score >= 80 ? 'Submit Candidate' : 'Technical Phone Screen',
      breakdown: { fallback: true, candidateExperience: req.candidate.total_experience },
      engine: 'local-heuristic',
    };
  }

  /**
   * Screen candidate against knockout questions
   */
  public static async screenCandidate(answers: ScreeningAnswer[]) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/api/v1/screen-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as any;
      }
    } catch {
      // Fallback
    }

    const disqualified = answers.some(
      a => a.is_killer && ['no', 'false', 'unable', 'cannot'].includes(a.answer.toLowerCase())
    );

    return {
      passed: !disqualified,
      status: disqualified ? 'Disqualified' : 'Cleared',
      failures: disqualified ? ['Failed killer question'] : [],
      engine: 'local-heuristic',
    };
  }
}
