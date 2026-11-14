#!/usr/bin/env python3
"""
Pavion RTS – Nightly Compliance & Credential Expiration Auditor
Scans all active candidate placements and contracts for expiring work authorizations (OPT/CPT/H-1B).
"""

from datetime import datetime, timedelta

def audit_expiring_credentials():
    print("=== Pavion RTS: Running Nightly Compliance & Work Auth Audit ===")
    mock_candidates = [
        {"name": "Ananya Joshi", "visa": "OPT-EAD", "expires_in_days": 28},
        {"name": "Rajesh Kumar", "visa": "H-1B", "expires_in_days": 54},
        {"name": "Deepak Mehta", "visa": "US Citizen", "expires_in_days": 9999}
    ]

    alerts_30_days = []
    alerts_60_days = []

    for c in mock_candidates:
        if c["expires_in_days"] <= 30:
            alerts_30_days.append(c)
        elif c["expires_in_days"] <= 60:
            alerts_60_days.append(c)

    print(f"  [ALERT - 30 DAYS]: {len(alerts_30_days)} candidates need immediate extension filing:")
    for a in alerts_30_days:
        print(f"    - {a['name']} ({a['visa']}): Expiration in {a['expires_in_days']} days")

    print(f"  [WARNING - 60 DAYS]: {len(alerts_60_days)} candidates need renewal notice dispatched:")
    for a in alerts_60_days:
        print(f"    - {a['name']} ({a['visa']}): Expiration in {a['expires_in_days']} days")

    print("=== Compliance Audit Routine Complete ===")

if __name__ == "__main__":
    audit_expiring_credentials()
