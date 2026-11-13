"""
Pavion Technologies AI Engine - Candidate-Job Matching & Screening Module
Calculates weighted compatibility scores (0-100%) and evaluates killer questions.
"""

import math
from typing import Dict, List, Any


class CandidateJobMatcher:
    """Semantic Matcher comparing candidate credentials against job requisition requirements."""

    @staticmethod
    def calculate_skill_overlap(candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
        """Calculates overlap, matched skills, and missing skills."""
        c_set = {s.lower().strip() for s in candidate_skills}
        r_set = {s.lower().strip() for s in required_skills}

        if not r_set:
            return {
                "overlap_ratio": 1.0,
                "matched_skills": candidate_skills,
                "missing_skills": []
            }

        matched = [s for s in r_set if any(s in cs or cs in s for cs in c_set)]
        missing = [s for s in r_set if s not in matched]

        ratio = len(matched) / len(r_set)
        return {
            "overlap_ratio": ratio,
            "matched_skills": [m.title() for m in matched],
            "missing_skills": [m.title() for m in missing]
        }

    @classmethod
    def match(cls, candidate: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates holistic match score between candidate and job requisition.
        Weighted: 50% Skill Match, 25% Experience Match, 15% Work Auth, 10% Rate Alignment.
        """
        # 1. Skill Match (50%)
        candidate_skills = candidate.get("skills", [])
        if isinstance(candidate_skills, str):
            candidate_skills = [s.strip() for s in candidate_skills.split(",") if s.strip()]

        required_skills = job.get("required_skills", [])
        if isinstance(required_skills, str):
            required_skills = [s.strip() for s in required_skills.split(",") if s.strip()]

        skill_res = cls.calculate_skill_overlap(candidate_skills, required_skills)
        skill_score = skill_res["overlap_ratio"] * 100.0

        # 2. Experience Match (25%)
        c_exp = float(candidate.get("total_experience", 0))
        min_exp = float(job.get("experience_min", 0))
        if c_exp >= min_exp:
            exp_score = 100.0
        elif c_exp > 0 and min_exp > 0:
            exp_score = max(40.0, (c_exp / min_exp) * 100.0)
        else:
            exp_score = 75.0

        # 3. Work Authorization Match (15%)
        c_auth = candidate.get("work_authorization", "US Citizen")
        j_auth_required = job.get("work_authorization_required", "Any")
        if j_auth_required == "Any" or c_auth in ["US Citizen", "Green Card"]:
            auth_score = 100.0
        elif "H-1B" in c_auth and "H-1B" in j_auth_required:
            auth_score = 100.0
        else:
            auth_score = 80.0

        # 4. Rate Alignment (10%)
        expected_rate = float(candidate.get("expected_pay_rate", 0))
        max_rate = float(job.get("pay_rate_max", 0))
        if max_rate > 0 and expected_rate > 0:
            if expected_rate <= max_rate:
                rate_score = 100.0
            else:
                diff_pct = (expected_rate - max_rate) / max_rate
                rate_score = max(30.0, 100.0 - (diff_pct * 150.0))
        else:
            rate_score = 90.0

        # Overall Weighted Score
        overall_match = (
            (skill_score * 0.50) +
            (exp_score * 0.25) +
            (auth_score * 0.15) +
            (rate_score * 0.10)
        )
        overall_match = round(min(98.5, max(35.0, overall_match)), 1)

        # Recommendation Categorization
        if overall_match >= 85.0:
            recommendation = "Strong Match - High Priority Submittal"
            action = "Fast-track to Client Submission"
        elif overall_match >= 70.0:
            recommendation = "Good Match - Recruiter Phone Screen Recommended"
            action = "Conduct Technical Screening"
        else:
            recommendation = "Moderate Match - Potential Skill Gap"
            action = "Review Missing Competencies"

        return {
            "match_score": overall_match,
            "skill_match_percentage": round(skill_score, 1),
            "matched_skills": skill_res["matched_skills"],
            "missing_skills": skill_res["missing_skills"],
            "recommendation": recommendation,
            "action": action,
            "breakdown": {
                "skills_weight": 50,
                "experience_score": round(exp_score, 1),
                "work_auth_score": round(auth_score, 1),
                "rate_alignment_score": round(rate_score, 1)
            }
        }

    @staticmethod
    def evaluate_killer_questions(answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates knockout / killer screening questions.
        Any critical failure results in an automatic disqualification flag.
        Supports explicit expected_answer comparison or default knockout heuristic.
        """
        passed = True
        failures = []

        for item in answers:
            q = item.get("question", "")
            a = str(item.get("answer", "")).strip().lower()
            is_killer = item.get("is_killer", True)
            expected = item.get("expected_answer")

            if is_killer:
                if expected is not None:
                    exp = str(expected).strip().lower()
                    if a != exp:
                        passed = False
                        failures.append(f"Disqualified on: {q} (Expected: {expected}, Provided: {item.get('answer')})")
                else:
                    # General knockout questions: "Do you have valid work auth?", "Can you pass background check?"
                    if a in ["no", "false", "unable", "cannot", "disagree"]:
                        passed = False
                        failures.append(f"Disqualified on: {q}")

        return {
            "passed": passed,
            "status": "Cleared" if passed else "Disqualified",
            "failures": failures,
            "total_questions_evaluated": len(answers)
        }
