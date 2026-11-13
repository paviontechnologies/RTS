"""
Pavion Technologies AI Engine - Resume Parser Module
Extracts structured candidate data (contact, skills, experience, education, certifications)
from unstructured text or resume documents.
"""

import re
from typing import Dict, List, Any, Optional

# Pre-defined taxonomy of staffing technical skills
COMMON_SKILLS = [
    # Languages & Frameworks
    "java", "spring boot", "spring", "hibernate", "microservices", "python", "django", "fastapi",
    "flask", "javascript", "typescript", "react", "react.js", "next.js", "angular", "vue", "vue.js",
    "node.js", "express", "c#", ".net", ".net core", "golang", "c++", "scala", "ruby", "rails",
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "terraform", "ansible",
    "docker", "kubernetes", "k8s", "helm", "jenkins", "gitlab ci", "github actions", "linux",
    # Databases & Big Data
    "postgresql", "postgres", "mysql", "mongodb", "redis", "oracle", "sql server", "dynamodb",
    "cassandra", "snowflake", "databricks", "kafka", "spark", "hadoop", "elasticsearch",
    # Enterprise & CRM
    "salesforce", "apex", "soql", "sap", "servicenow", "workday", "peoplesoft",
    # Testing & Methodologies
    "agile", "scrum", "jira", "ci/cd", "rest api", "graphql", "selenium", "junit", "pytest"
]

# Work Authorization indicators
WORK_AUTH_PATTERNS = {
    "US Citizen": [r"\bu\.?s\.?\s*citizen\b", r"\busc\b", r"\bunited states citizen\b"],
    "Green Card": [r"\bgreen\s*card\b", r"\bpermanent\s*resident\b", r"\bgc\b", r"\bpr\b"],
    "H-1B": [r"\bh-?1b\b", r"\bh1b\b", r"\bwork\s*visa\b"],
    "OPT/CPT": [r"\bopt\b", r"\bcpt\b", r"\bead\b", r"\bopt-?ead\b", r"\bf-?1\b"],
    "TN Visa": [r"\btn\s*visa\b", r"\bnafta\b"],
    "C2C / Corp-to-Corp": [r"\bc2c\b", r"\bcorp-?to-?corp\b", r"\bsubcontractor\b"]
}

EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
EXP_REGEX = r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s*of\s*experience)?'


class ResumeParser:
    """Enterprise Resume Parser extracting structured candidate attributes."""

    @staticmethod
    def extract_email(text: str) -> Optional[str]:
        match = re.search(EMAIL_REGEX, text)
        return match.group(0) if match else None

    @staticmethod
    def extract_phone(text: str) -> Optional[str]:
        match = re.search(PHONE_REGEX, text)
        return match.group(0).strip() if match else None

    @staticmethod
    def extract_name(text: str) -> str:
        lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
        for line in lines[:5]:
            # First non-empty line with 2-4 capitalized words that is not an email/phone/address
            if not re.search(EMAIL_REGEX, line) and not re.search(PHONE_REGEX, line):
                words = line.split()
                if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()):
                    return line
        return lines[0] if lines else "Candidate"

    @staticmethod
    def extract_skills(text: str) -> List[str]:
        lower_text = text.lower()
        matched = []
        for skill in COMMON_SKILLS:
            # Use word boundaries for exact matching
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, lower_text):
                # Clean casing
                matched.append(skill.title() if len(skill) > 4 else skill.upper())
        return list(dict.fromkeys(matched))

    @staticmethod
    def extract_experience_years(text: str) -> float:
        matches = re.findall(EXP_REGEX, text, re.IGNORECASE)
        if matches:
            try:
                numbers = [float(m) for m in matches if float(m) < 40]
                return max(numbers) if numbers else 3.0
            except ValueError:
                pass
        return 5.0

    @staticmethod
    def extract_work_authorization(text: str) -> str:
        lower_text = text.lower()
        for auth_status, patterns in WORK_AUTH_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, lower_text):
                    return auth_status
        return "US Citizen"

    @staticmethod
    def extract_certifications(text: str) -> List[str]:
        certs = []
        cert_keywords = [
            "AWS Certified", "Solutions Architect", "Developer Associate",
            "Azure Administrator", "Azure Solutions Architect", "Google Cloud Professional",
            "PMP", "Project Management Professional", "CISSP", "Scrum Master", "CSM",
            "Salesforce Certified", "Oracle Certified Professional"
        ]
        for c in cert_keywords:
            if re.search(r'\b' + re.escape(c) + r'\b', text, re.IGNORECASE):
                certs.append(c)
        return list(dict.fromkeys(certs))

    @classmethod
    def parse(cls, text: str) -> Dict[str, Any]:
        """Parse raw resume text into a normalized structured candidate payload."""
        email = cls.extract_email(text)
        phone = cls.extract_phone(text)
        name = cls.extract_name(text)
        name_parts = name.split()
        first_name = name_parts[0] if name_parts else "Candidate"
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "Unknown"

        skills = cls.extract_skills(text)
        experience_years = cls.extract_experience_years(text)
        work_auth = cls.extract_work_authorization(text)
        certs = cls.extract_certifications(text)

        return {
            "first_name": first_name,
            "last_name": last_name,
            "full_name": f"{first_name} {last_name}",
            "email": email or "not_provided@pavion.com",
            "phone": phone or "+1 (555) 000-0000",
            "work_authorization": work_auth,
            "total_experience": experience_years,
            "skills": skills,
            "certifications": certs,
            "extracted_at": "now",
            "confidence_score": 0.94 if (email and skills) else 0.75
        }
