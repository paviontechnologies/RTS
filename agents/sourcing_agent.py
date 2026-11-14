#!/usr/bin/env python3
"""
Pavion RTS – Autonomous Sourcing Agent
Generates Boolean search strings and identifies candidate profiles across internal/external sources.
"""

import sys
from typing import List, Dict

class SourcingAgent:
    @staticmethod
    def generate_boolean_query(title: str, skills: List[str], location: str = "") -> str:
        """Constructs an optimized Boolean search query for LinkedIn Recruiter / Dice."""
        clean_title = f'"{title}"'
        clean_skills = " AND ".join([f'"{s}"' if " " in s else s for s in skills])
        query = f'({clean_title}) AND ({clean_skills})'
        if location:
            query += f' AND ("{location}" OR "Remote")'
        return query

    @staticmethod
    def filter_talent_pool(candidates: List[Dict], required_skills: List[str], min_exp: float) -> List[Dict]:
        """Filters an internal talent pool to identify matching candidates."""
        req_set = {s.lower() for s in required_skills}
        shortlist = []
        for c in candidates:
            c_skills = {s.lower() for s in c.get("skills", [])}
            overlap = len(req_set.intersection(c_skills))
            if overlap >= len(req_set) * 0.6 and c.get("total_experience", 0) >= min_exp:
                shortlist.append(c)
        return shortlist

if __name__ == "__main__":
    agent = SourcingAgent()
    query = agent.generate_boolean_query(
        "Senior Cloud Architect",
        ["AWS", "Terraform", "Kubernetes", "Python"],
        "Dallas, TX"
    )
    print(f"Generated Boolean Query:\n{query}")
