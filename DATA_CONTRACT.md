# Pavion RTS – Inter-Service Data Contracts

Defines standard JSON contracts exchanged between the API Gateway, AI Engine, and S3 Storage.

### 1. Candidate Extraction Contract
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "total_experience": 5.0,
  "skills": ["Python", "FastAPI", "PostgreSQL"],
  "work_authorization": "US Citizen",
  "confidence_score": 0.95
}
```

### 2. Match Scoring Contract
```json
{
  "match_score": 92.5,
  "skill_match_percentage": 100.0,
  "matched_skills": ["PYTHON", "AWS", "DOCKER"],
  "missing_skills": [],
  "recommendation": "Strong Match - High Priority Submittal",
  "action": "Fast-track to Client Submission"
}
```
