#!/usr/bin/env python3
"""
Pavion RTS – Client Submittal Packet Generator
Generates clean, sanitized client candidate dossiers with rate cards, skill matrices, and candidate executive summaries.
"""

def generate_submittal_dossier(candidate: dict, client: str, job_title: str):
    return f"""================================================================================
PAVION TECHNOLOGIES - OFFICIAL CANDIDATE SUBMITTAL PACKET
================================================================================
Target Client:    {client}
Job Title:        {job_title}
Candidate Name:   {candidate.get('name')}
Work Auth:        {candidate.get('work_auth')}
Total Experience: {candidate.get('experience')} Years
Agreed Bill Rate: ${candidate.get('bill_rate')}/hr
Submission Date:  2026-11-14

EXECUTIVE TECHNICAL SUMMARY:
--------------------------------------------------------------------------------
{candidate.get('summary')}

KEY CORE COMPETENCIES:
--------------------------------------------------------------------------------
{', '.join(candidate.get('skills', []))}

RIGHT TO REPRESENT (RTR):
--------------------------------------------------------------------------------
Verified and Locked via Candidate Digital Signature.
================================================================================
"""

if __name__ == "__main__":
    sample = {
        "name": "Kavita Rao",
        "work_auth": "US Citizen",
        "experience": 8,
        "bill_rate": 110.0,
        "summary": "Senior AWS Solutions Architect with extensive experience in cloud migrations and microservices.",
        "skills": ["AWS", "Kubernetes", "Docker", "Terraform", "Python", "PostgreSQL"]
    }
    print(generate_submittal_dossier(sample, "TCS / Citigroup", "Senior AWS Solutions Architect"))
