"""
Unit tests for Pavion RTS AI Engine (Resume Parser & Candidate Matcher)
"""

import sys
import os
import unittest

# Ensure the service directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from parser import ResumeParser
from matcher import CandidateJobMatcher


class TestResumeParser(unittest.TestCase):
    def setUp(self):
        self.sample_resume = """
        Johnathan Alexander Doe
        Senior Full Stack Cloud Engineer
        Email: jdoe.eng@paviontechnologies.com
        Cell: (555) 234-5678
        Location: Dallas, TX (US Citizen)

        PROFESSIONAL SUMMARY
        Over 8 years of experience building high-scale distributed microservices.
        Expertise in Python, FastAPI, TypeScript, React, PostgreSQL, Docker, Kubernetes, and AWS.

        CERTIFICATIONS
        - AWS Certified Solutions Architect
        - Certified Scrum Master (CSM)
        """

    def test_extract_contact_info(self):
        email = ResumeParser.extract_email(self.sample_resume)
        self.assertEqual(email, "jdoe.eng@paviontechnologies.com")

        phone = ResumeParser.extract_phone(self.sample_resume)
        self.assertIn("555", phone)
        self.assertIn("234-5678", phone)

    def test_extract_skills(self):
        skills = ResumeParser.extract_skills(self.sample_resume)
        self.assertTrue(any("Python" in s for s in skills))
        self.assertTrue(any("Fastapi" in s or "FASTAPI" in s for s in skills))
        self.assertTrue(any("Docker" in s for s in skills))
        self.assertTrue(any("Kubernetes" in s for s in skills))

    def test_extract_experience_and_auth(self):
        years = ResumeParser.extract_experience_years(self.sample_resume)
        self.assertEqual(years, 8.0)

        auth = ResumeParser.extract_work_authorization(self.sample_resume)
        self.assertEqual(auth, "US Citizen")

    def test_full_parse_payload(self):
        parsed = ResumeParser.parse(self.sample_resume)
        self.assertEqual(parsed["email"], "jdoe.eng@paviontechnologies.com")
        self.assertEqual(parsed["work_authorization"], "US Citizen")
        self.assertEqual(parsed["total_experience"], 8.0)
        self.assertGreaterEqual(len(parsed["skills"]), 4)
        self.assertGreaterEqual(parsed["confidence_score"], 0.90)


class TestCandidateJobMatcher(unittest.TestCase):
    def setUp(self):
        self.job = {
            "title": "Senior Cloud Backend Engineer",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
            "experience_min": 5.0,
            "work_authorization_required": "Any",
            "pay_rate_max": 95.0
        }

    def test_strong_match(self):
        candidate = {
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Redis"],
            "total_experience": 7.0,
            "work_authorization": "US Citizen",
            "expected_pay_rate": 90.0
        }
        res = CandidateJobMatcher.match(candidate, self.job)
        self.assertGreaterEqual(res["match_score"], 85.0)
        self.assertEqual(res["skill_match_percentage"], 100.0)
        self.assertIn("Strong Match", res["recommendation"])

    def test_partial_match(self):
        candidate = {
            "skills": ["Python", "Django"],
            "total_experience": 3.0,
            "work_authorization": "US Citizen",
            "expected_pay_rate": 80.0
        }
        res = CandidateJobMatcher.match(candidate, self.job)
        self.assertLess(res["match_score"], 80.0)
        missing_lower = [s.lower() for s in res["missing_skills"]]
        self.assertIn("postgresql", missing_lower)

    def test_killer_questions_cleared(self):
        answers = [
            {"question": "Are you legally authorized to work in the United States?", "answer": "Yes", "is_killer": True},
            {"question": "Will you now or in the future require sponsorship?", "answer": "No", "expected_answer": "No", "is_killer": True},
            {"question": "Can you work hybrid in Dallas, TX?", "answer": "Yes", "is_killer": True}
        ]
        result = CandidateJobMatcher.evaluate_killer_questions(answers)
        self.assertTrue(result["passed"])
        self.assertEqual(result["status"], "Cleared")
        self.assertEqual(len(result["failures"]), 0)

    def test_killer_questions_disqualified(self):
        answers = [
            {"question": "Are you able to pass a 10-panel drug test and background check?", "answer": "No", "is_killer": True}
        ]
        result = CandidateJobMatcher.evaluate_killer_questions(answers)
        self.assertFalse(result["passed"])
        self.assertEqual(result["status"], "Disqualified")
        self.assertEqual(len(result["failures"]), 1)


if __name__ == "__main__":
    unittest.main()
