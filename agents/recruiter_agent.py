#!/usr/bin/env python3
"""
Pavion RTS – Autonomous Recruiter Agent
Evaluates candidate compatibility, ranks candidate submissions, and predicts placement fit.
"""

import sys
import json
from typing import List, Dict, Any

class RecruiterAgent:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            "skills": 0.50,
            "experience": 0.25,
            "work_auth": 0.15,
            "rate": 0.10
        }

    def evaluate_candidate(self, candidate: Dict[str, Any], requisition: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates multi-dimensional compatibility score (0-100)."""
        # Skill Overlap
        cand_skills = {s.lower().strip() for s in candidate.get("skills", [])}
        req_skills = {s.lower().strip() for s in requisition.get("required_skills", [])}
        matched = cand_skills.intersection(req_skills)
        missing = req_skills - cand_skills
        skill_ratio = len(matched) / len(req_skills) if req_skills else 1.0
        skill_score = skill_ratio * 100.0

        # Experience Score
        cand_exp = float(candidate.get("total_experience", 0))
        min_exp = float(requisition.get("experience_min", 0))
        exp_score = min(100.0, (cand_exp / min_exp) * 100.0) if min_exp > 0 else 100.0

        # Work Auth Score
        auth = candidate.get("work_authorization", "US Citizen")
        auth_score = 100.0 if auth in ["US Citizen", "Green Card"] else 85.0

        # Rate Alignment
        cand_rate = float(candidate.get("expected_pay_rate", 0))
        max_rate = float(requisition.get("pay_rate_max", 0))
        rate_score = 100.0 if cand_rate <= max_rate or max_rate == 0 else max(40.0, 100.0 - ((cand_rate - max_rate) / max_rate * 100.0))

        overall = (
            (skill_score * self.weights["skills"]) +
            (exp_score * self.weights["experience"]) +
            (auth_score * self.weights["work_auth"]) +
            (rate_score * self.weights["rate"])
        )
        overall = round(min(99.0, max(30.0, overall)), 1)

        decision = "Fast-track Submission" if overall >= 85 else "Phone Screen" if overall >= 70 else "Review Gaps"

        return {
            "candidate_id": candidate.get("id"),
            "candidate_name": candidate.get("full_name"),
            "match_score": overall,
            "matched_skills": [s.title() for s in matched],
            "missing_skills": [s.title() for s in missing],
            "recommendation": decision,
            "breakdown": {
                "skill_score": round(skill_score, 1),
                "experience_score": round(exp_score, 1),
                "work_auth_score": round(auth_score, 1),
                "rate_score": round(rate_score, 1)
            }
        }

if __name__ == "__main__":
    agent = RecruiterAgent()
    sample_cand = {
        "id": "C-101",
        "full_name": "Siddharth Rao",
        "skills": ["AWS", "Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
        "total_experience": 8.0,
        "work_authorization": "US Citizen",
        "expected_pay_rate": 85.0
    }
    sample_req = {
        "id": "REQ-501",
        "title": "Lead Cloud Microservices Engineer",
        "required_skills": ["Java", "Spring Boot", "AWS", "Docker", "Kubernetes"],
        "experience_min": 7.0,
        "pay_rate_max": 90.0
    }
    res = agent.evaluate_candidate(sample_cand, sample_req)
    print(json.dumps(res, indent=2))
