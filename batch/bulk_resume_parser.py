#!/usr/bin/env python3
"""
Pavion RTS – High-Throughput Bulk Resume Parser Batch Job
Processes candidate resumes in parallel using multi-core worker threads.
"""

import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor

AI_ENGINE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../services/ai-engine"))
sys.path.insert(0, AI_ENGINE_PATH)

from parser import ResumeParser

def process_resume_batch(resume_texts):
    print(f"=== Pavion RTS: Processing Batch of {len(resume_texts)} Resumes ===")
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(ResumeParser.parse, resume_texts))

    duration = time.time() - start_time
    print(f"  [OK] Ingested and structured {len(results)} candidate profiles in {duration:.4f}s")
    return results

if __name__ == "__main__":
    sample_resumes = [
        "Aarav Sharma - Email: aarav@example.com - 8 years experience in AWS, Python, Kubernetes.",
        "Neha Verma - Email: neha@example.com - 5 years experience in React, TypeScript, Node.js.",
        "Kunal Singh - Email: kunal@example.com - 6 years experience in Java, Spring Boot, Kafka.",
        "Divya Nair - Email: divya@example.com - 7 years experience in Snowflake, DBT, Airflow."
    ]
    process_resume_batch(sample_resumes)
