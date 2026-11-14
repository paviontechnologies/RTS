#!/usr/bin/env python3
"""
Pavion RTS – Candidate Outreach & RTR Agent
Generates personalized candidate outreach emails, Right-to-Represent (RTR) agreements, and submittal packets.
"""

class OutreachAgent:
    @staticmethod
    def generate_rtr_email(candidate_name: str, job_title: str, client_name: str, pay_rate: float) -> str:
        return f"""Subject: Exclusive Right to Represent (RTR) Request - {job_title} at {client_name}

Hi {candidate_name},

Thank you for discussing the {job_title} opportunity with Pavion Technologies.

We are ready to present your profile to {client_name} at an agreed compensation rate of ${pay_rate:.2f}/hr.

To ensure exclusive representation and protect your submission, please reply with:
"I, {candidate_name}, authorize Pavion Technologies to exclusively represent me for the position of {job_title} at {client_name}."

Best regards,
Pavion Technologies Recruitment Operations Team
"""

if __name__ == "__main__":
    agent = OutreachAgent()
    print(agent.generate_rtr_email("Aarav Sharma", "AWS Solutions Architect", "TCS / Citigroup", 95.0))
