#!/usr/bin/env python3
"""
Pavion RTS – Knockout Screening Agent
Automatically evaluates applicant questionnaire responses against knockout criteria.
"""

from typing import List, Dict, Any

class ScreeningAgent:
    @staticmethod
    def evaluate(answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        disqualified = False
        reasons = []

        for item in answers:
            q = item.get("question", "")
            ans = str(item.get("answer", "")).strip().lower()
            expected = item.get("expected")

            if expected:
                if ans != str(expected).strip().lower():
                    disqualified = True
                    reasons.append(f"Failed criteria on '{q}': Expected '{expected}', received '{item.get('answer')}'")
            else:
                if ans in ["no", "false", "unable", "disagree"]:
                    disqualified = True
                    reasons.append(f"Knockout response on '{q}'")

        return {
            "status": "Disqualified" if disqualified else "Cleared",
            "passed": not disqualified,
            "disqualification_reasons": reasons,
            "evaluated_questions": len(answers)
        }

if __name__ == "__main__":
    agent = ScreeningAgent()
    results = agent.evaluate([
        {"question": "Are you legally authorized to work in the US?", "answer": "Yes", "expected": "Yes"},
        {"question": "Can you commute hybrid to Plano, TX?", "answer": "Yes", "expected": "Yes"}
    ])
    print(results)
