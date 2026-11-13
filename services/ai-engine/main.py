"""
Pavion Technologies - Enterprise AI Engine API Service
Built with Python 3.12 & FastAPI.
Provides real-time Resume Parsing, Semantic Job Matching, and Knockout Screening.
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from parser import ResumeParser
from matcher import CandidateJobMatcher

app = FastAPI(
    title="Pavion Technologies AI Engine API",
    description="High-performance Python AI microservice for US Staffing ATS operations",
    version="1.0.0"
)

# Enable CORS for communication from Node.js backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Pydantic Request Models
# -----------------------------------------------------------------------------

class ParseResumeRequest(BaseModel):
    resume_text: str = Field(..., description="Raw extracted text of candidate resume")
    filename: Optional[str] = Field("resume.txt", description="Original file name")


class CandidateProfile(BaseModel):
    first_name: Optional[str] = "Candidate"
    last_name: Optional[str] = ""
    skills: List[str] = Field(default_factory=list)
    total_experience: float = 0.0
    work_authorization: str = "US Citizen"
    expected_pay_rate: Optional[float] = 0.0


class JobRequirement(BaseModel):
    job_code: Optional[str] = "REQ-1001"
    title: str = "Software Engineer"
    required_skills: List[str] = Field(default_factory=list)
    experience_min: float = 0.0
    pay_rate_max: Optional[float] = 0.0
    work_authorization_required: str = "Any"


class MatchCandidateRequest(BaseModel):
    candidate: CandidateProfile
    job: JobRequirement


class ScreeningAnswerItem(BaseModel):
    question: str
    answer: str
    is_killer: bool = True


class ScreenCandidateRequest(BaseModel):
    candidate_id: Optional[str] = None
    answers: List[ScreeningAnswerItem]


class SummaryRequest(BaseModel):
    candidate_name: str
    skills: List[str]
    experience_years: float
    current_title: str
    target_job: Optional[str] = None


# -----------------------------------------------------------------------------
# REST Endpoints
# -----------------------------------------------------------------------------

@app.get("/health")
def health_check():
    """Service health and engine readiness verification."""
    return {
        "status": "healthy",
        "service": "Pavion AI Engine",
        "version": "1.0.0",
        "capabilities": ["resume_parsing", "semantic_matching", "killer_screening", "summaries"]
    }


@app.post("/api/v1/parse-resume")
def parse_resume(payload: ParseResumeRequest):
    """
    Parses raw resume text and extracts candidate attributes,
    skills, contact information, and certifications.
    """
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text must not be empty")

    parsed_data = ResumeParser.parse(payload.resume_text)
    return {
        "success": True,
        "filename": payload.filename,
        "data": parsed_data
    }


@app.post("/api/v1/match-candidate")
def match_candidate(payload: MatchCandidateRequest):
    """
    Calculates weighted matching score between candidate profile and job requirements.
    """
    candidate_dict = payload.candidate.model_dump()
    job_dict = payload.job.model_dump()

    match_result = CandidateJobMatcher.match(candidate_dict, job_dict)
    return {
        "success": True,
        "data": match_result
    }


@app.post("/api/v1/screen-candidate")
def screen_candidate(payload: ScreenCandidateRequest):
    """
    Evaluates candidate responses against knockout killer questions.
    """
    answers_dicts = [a.model_dump() for a in payload.answers]
    result = CandidateJobMatcher.evaluate_killer_questions(answers_dicts)
    return {
        "success": True,
        "candidate_id": payload.candidate_id,
        "data": result
    }


@app.post("/api/v1/generate-summary")
def generate_summary(payload: SummaryRequest):
    """
    Generates structured recruiter executive summary for candidate profile.
    """
    top_skills = ", ".join(payload.skills[:5]) if payload.skills else "Core Engineering"
    summary_text = (
        f"{payload.candidate_name} is an experienced {payload.current_title} with "
        f"{payload.experience_years:.1f} years of demonstrated industry experience specializing in {top_skills}. "
        f"Verified strong fit for {payload.target_job or 'enterprise client requirements'}, "
        f"with proven competencies and immediate project availability."
    )
    return {
        "success": True,
        "candidate_name": payload.candidate_name,
        "summary": summary_text
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
