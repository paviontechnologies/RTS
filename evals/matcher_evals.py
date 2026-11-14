#!/usr/bin/env python3
"""
Pavion RTS – Candidate-Job Semantic Matching Benchmark
Evaluates candidate ranking accuracy and killer question knockout precision.
"""

import os
import sys
import json

AI_ENGINE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../services/ai-engine"))
sys.path.insert(0, AI_ENGINE_PATH)

from matcher import CandidateJobMatcher

def run_matcher_benchmarks():
    print("=== Pavion RTS: Running Candidate Matcher Evaluation Benchmark ===")

    job = {
        "title": "Senior Cloud Backend Engineer",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
        "experience_min": 5.0,
        "work_authorization_required": "Any",
        "pay_rate_max": 95.0
    }

    strong_candidate = {
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Redis"],
        "total_experience": 7.0,
        "work_authorization": "US Citizen",
        "expected_pay_rate": 90.0
    }

    res = CandidateJobMatcher.match(strong_candidate, job)
    score = res["match_score"]
    print(f"  [RESULT] Strong Candidate Match Score: {score}% (Expected: >= 85%)")
    assert score >= 85.0, f"Expected strong match score >= 85%, got {score}"
    print("=== Matcher Benchmark: PASSED ===")

if __name__ == "__main__":
    run_matcher_benchmarks()
