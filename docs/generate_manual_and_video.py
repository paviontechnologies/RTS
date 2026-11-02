import os
from PIL import Image, ImageDraw, ImageFont

# Ensure output directory exists
os.makedirs('/Users/mac/Desktop/RTS/docs/images', exist_ok=True)

# Helper to draw rounded rectangle
def draw_card(draw, box, fill, outline=None, width=1, radius=12):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

# Helper to draw badge
def draw_badge(draw, xy, text, bg_color, text_color):
    x, y = xy
    w = len(text) * 8 + 16
    h = 24
    draw.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=bg_color)
    draw.text((x + 8, y + 4), text, fill=text_color)

# Page width & height (A4 at 150 DPI: 1240 x 1754)
W, H = 1240, 1754
NAVY = (15, 23, 42)      # #0f172a
BLUE = (37, 99, 235)     # #2563eb
TEAL = (13, 148, 136)    # #0d9488
LIGHT_BG = (248, 250, 252) # #f8fafc
CARD_BG = (255, 255, 255)
BORDER = (226, 232, 240) # #e2e8f0
TEXT_MAIN = (30, 41, 59) # #1e293b
TEXT_MUTED = (100, 116, 139) # #64748b
GREEN = (22, 163, 74)
ORANGE = (234, 88, 12)
PURPLE = (147, 51, 234)

pages = []

# =============================================================================
# PAGE 1: COVER PAGE
# =============================================================================
p1 = Image.new('RGB', (W, H), color=NAVY)
d1 = ImageDraw.Draw(p1)

# Header branding
d1.rectangle([0, 0, W, 18], fill=BLUE)
d1.text((80, 120), "PAVION TECHNOLOGIES PVT. LTD.", fill=TEAL)
d1.text((80, 160), "ENTERPRISE US STAFFING ATS + CRM PLATFORM", fill=(255, 255, 255))
d1.text((80, 230), "Official User Training Manual & Operations Guide", fill=(148, 163, 184))

# Divider
d1.line([(80, 290), (W - 80, 290)], fill=(51, 65, 85), width=2)

# Central Visual Card (Mockup style)
draw_card(d1, [80, 340, W - 80, 1150], fill=(30, 41, 59), outline=BLUE, width=2, radius=16)

# Title inside card
d1.text((120, 380), "CORE PLATFORM MODULES & ROLE WORKFLOWS", fill=(255, 255, 255))
d1.text((120, 415), "Comprehensive operational handbook for Recruiters, Account Managers, Sales, & Admins", fill=(148, 163, 184))

# 4 Modules Grid
modules = [
    ("👑 Super Admin Governance", "System control, multi-tenant settings, audit logs, revenue metrics, user roles", BLUE),
    ("🎯 Senior Recruiter Workbench", "AI resume parser, candidate pool (55 Indian techies), 16-stage pipeline, RTR consent", GREEN),
    ("💼 Account Manager Coordination", "Enterprise accounts (TCS, Infosys, Wipro, HCL), job requisitions, client feedback", ORANGE),
    ("📈 Sales & Business Development", "CRM leads, B2B deal pipeline ($485k), discovery meetings, activity touchpoints", PURPLE),
]

y_pos = 480
for title, desc, color in modules:
    draw_card(d1, [120, y_pos, W - 120, y_pos + 120], fill=(15, 23, 42), outline=color, width=2, radius=10)
    d1.rectangle([120, y_pos, 130, y_pos + 120], fill=color)
    d1.text((150, y_pos + 25), title, fill=(255, 255, 255))
    d1.text((150, y_pos + 65), desc, fill=(148, 163, 184))
    y_pos += 150

# Features callout
draw_card(d1, [120, 1100, W - 120, 1260], fill=(15, 23, 42), outline=TEAL, width=2, radius=10)
d1.text((150, 1125), "INCLUDED TEST DATASET HIGHLIGHTS", fill=TEAL)
d1.text((150, 1165), "• 55+ Indian Candidates (Recent MS Grads on OPT/CPT, H1-B, Green Card, US Citizens)", fill=(255, 255, 255))
d1.text((150, 1195), "• 15 Enterprise Client Accounts (TCS America, Infosys, Wipro, HCL, Tech Mahindra, LTIMindtree)", fill=(255, 255, 255))
d1.text((150, 1225), "• 18-Table Production PostgreSQL DDL Architecture & Live SQLite Synchronization", fill=(255, 255, 255))

# Footer metadata
d1.line([(80, 1600), (W - 80, 1600)], fill=(51, 65, 85), width=2)
d1.text((80, 1630), "Platform Version: v2.4 Enterprise | Documentation Release: November 2026", fill=(148, 163, 184))
d1.text((80, 1660), "CONFIDENTIAL & PROPRIETARY – PAVION TECHNOLOGIES PVT. LTD.", fill=TEAL)
pages.append(p1)

# =============================================================================
# PAGE 2: 4 ROLE-BASED DASHBOARDS & TOPBAR ROLE SWITCHER
# =============================================================================
p2 = Image.new('RGB', (W, H), color=LIGHT_BG)
d2 = ImageDraw.Draw(p2)

# Header banner
d2.rectangle([0, 0, W, 80], fill=NAVY)
d2.text((80, 25), "CHAPTER 1: FOUR ROLE-BASED USER INTERFACES", fill=(255, 255, 255))

# Section description
d2.text((80, 110), "Instant 1-Click Role Switcher in Topbar", fill=BLUE)
d2.text((80, 140), "Pavion RTS features specialized UI dashboards tailored for 4 distinct staffing roles.", fill=TEXT_MAIN)
d2.text((80, 165), "Users can switch roles instantly in the Topbar dropdown to test different permission levels:", fill=TEXT_MUTED)

# 4 Roles Detailed Cards
roles_data = [
    ("👑 Super Admin (Vikram Sharma)", BLUE, [
        "• Complete system governance and multi-tenant organization settings",
        "• Global KPIs: 55 Candidates, 15 Clients, 12 Jobs, $485,000 Revenue",
        "• Security audit trail monitoring and compliance logs",
        "• User management, staff permissions, and API integration settings"
    ]),
    ("🎯 Senior Recruiter (Alex Carter)", GREEN, [
        "• ATS Operations: Requisitions, Candidate Talent Pool, and Resume Ingestion",
        "• 16-Stage Recruitment Funnel (Sourced → Screening → RTR → Submitted → Placed)",
        "• AI Resume Parser Workbench: Skill extraction, rate cards, and de-duplication",
        "• Candidate Right-to-Represent (RTR) consent acquisition and tracking"
    ]),
    ("💼 Account Manager (Sarah Jenkins)", ORANGE, [
        "• Enterprise Client Delivery: TCS, Infosys, Wipro, HCL, Tech Mahindra",
        "• Recruiter Coordination Center (/ats/coordination): Assign reqs to recruiters",
        "• Client Feedback Portal (/ats/client-feedback): Review candidate submittals",
        "• Rate negotiations, MSA contracts, and consultant placement starts"
    ]),
    ("📈 Sales / BDE (Marcus Vance)", PURPLE, [
        "• CRM Acquisition: Prospect leads, company qualification, and contract deals",
        "• Sales Quota Progress Gauge: $380,000 achieved against $500,000 quota (76%)",
        "• Touchpoint Activity Logging (/crm/activities): Calls, meetings, emails, and notes",
        "• Client opportunity pipeline: Discovery, Proposal Sent, Negotiation, Closed Won"
    ]),
]

y_pos = 210
for r_title, r_color, r_bullets in roles_data:
    draw_card(d2, [80, y_pos, W - 80, y_pos + 270], fill=CARD_BG, outline=BORDER, width=2, radius=12)
    d2.rectangle([80, y_pos, 90, y_pos + 270], fill=r_color)
    d2.text((115, y_pos + 20), r_title, fill=r_color)
    b_y = y_pos + 65
    for b in r_bullets:
        d2.text((115, b_y), b, fill=TEXT_MAIN)
        b_y += 42
    y_pos += 300

# Footer
d2.text((80, 1680), "Pavion RTS Training Manual | Chapter 1: Role Interfaces | Page 2", fill=TEXT_MUTED)
pages.append(p2)

# =============================================================================
# PAGE 3: ATS TALENT POOL & INDIAN CANDIDATE TEST DATASET
# =============================================================================
p3 = Image.new('RGB', (W, H), color=LIGHT_BG)
d3 = ImageDraw.Draw(p3)

d3.rectangle([0, 0, W, 80], fill=NAVY)
d3.text((80, 25), "CHAPTER 2: ATS TALENT POOL & INDIAN CANDIDATE DIRECTORY", fill=(255, 255, 255))

d3.text((80, 110), "55 Indian Tech Professionals & Student Grads Available for Testing", fill=BLUE)
d3.text((80, 140), "Browse candidate profiles at: http://localhost:5173/ats/candidates", fill=TEXT_MUTED)

# Candidate Table Header
draw_card(d3, [80, 180, W - 80, 230], fill=NAVY, radius=8)
d3.text((100, 195), "CODE", fill=(255, 255, 255))
d3.text((240, 195), "CANDIDATE NAME", fill=(255, 255, 255))
d3.text((490, 195), "JOB TITLE / SPECIALIZATION", fill=(255, 255, 255))
d3.text((850, 195), "VISA STATUS", fill=(255, 255, 255))
d3.text((1000, 195), "EXP. RATE", fill=(255, 255, 255))

sample_cands = [
    ("CAN-IND-001", "Aarav Sharma", "Junior Cloud & DevOps Engineer", "OPT (UT Dallas)", "$55/hr C2C"),
    ("CAN-IND-002", "Ananya Iyer", "Fullstack React / Node.js Developer", "OPT (SJSU MS)", "$60/hr W2"),
    ("CAN-IND-003", "Rohan Verma", "Data Engineer / PySpark Specialist", "CPT (Illinois Tech)", "$50/hr W2"),
    ("CAN-IND-004", "Priya Patel", "QA Automation Engineer (Selenium+Cypress)", "OPT STEM (Rutgers)", "$55/hr C2C"),
    ("CAN-IND-005", "Arjun Reddy", "Cloud Infrastructure Associate", "OPT (Texas A&M)", "$52/hr C2C"),
    ("CAN-IND-006", "Sneha Joshi", "Machine Learning & NLP Engineer", "OPT STEM (NEU)", "$65/hr W2"),
    ("CAN-IND-007", "Kunal Kapoor", "Salesforce Lightning Developer", "OPT (Georgia State)", "$60/hr C2C"),
    ("CAN-IND-008", "Divya Pillai", "UI/UX & React Frontend Developer", "CPT (UNC Charlotte)", "$54/hr W2"),
    ("CAN-IND-011", "Rahul Nair", "Senior AWS DevOps & Platform Lead", "H1-B (Capgemini)", "$85/hr C2C"),
    ("CAN-IND-012", "Pooja Deshmukh", "Staff Java Microservices Architect", "H1-B (Cognizant)", "$82/hr C2C"),
    ("CAN-IND-013", "Siddharth Jain", "Lead Snowflake & Lakehouse Architect", "Green Card (Equifax)", "$95/hr C2C"),
    ("CAN-IND-014", "Meera Nambiar", "Senior Full Stack React + Node Lead", "H1-B (Uber)", "$88/hr C2C"),
    ("CAN-IND-015", "Aditya Rao", "Principal Site Reliability Engineer (SRE)", "US Citizen (AWS)", "$105/hr C2C"),
    ("CAN-IND-016", "Shweta Singh", "Senior Salesforce CPQ Consultant", "H1-B (Deloitte)", "$85/hr C2C"),
    ("CAN-IND-017", "Rakesh Mukherjee", "QA Automation Lead & SDET", "Green Card (Citi)", "$75/hr C2C"),
]

y_row = 240
for code, name, title, visa, rate in sample_cands:
    draw_card(d3, [80, y_row, W - 80, y_row + 55], fill=CARD_BG, outline=BORDER, radius=6)
    d3.text((100, y_row + 15), code, fill=BLUE)
    d3.text((240, y_row + 15), name, fill=TEXT_MAIN)
    d3.text((490, y_row + 15), title, fill=TEXT_MAIN)
    d3.text((850, y_row + 15), visa, fill=GREEN if "Citizen" in visa or "Green" in visa else ORANGE)
    d3.text((1000, y_row + 15), rate, fill=TEXT_MAIN)
    y_row += 62

# Instructions Card
draw_card(d3, [80, 1200, W - 80, 1600], fill=CARD_BG, outline=TEAL, width=2, radius=12)
d3.text((115, 1230), "HOW TO TEST CANDIDATE SEARCH & AI WORKBENCH:", fill=TEAL)
d3.text((115, 1280), "1. Open http://localhost:5173/ats/candidates in your web browser.", fill=TEXT_MAIN)
d3.text((115, 1320), "2. Search by skill keyword: Type 'AWS', 'Java', 'Snowflake', or 'React' in the search bar.", fill=TEXT_MAIN)
d3.text((115, 1360), "3. Filter by Visa Status: Select 'OPT', 'CPT', or 'H1-B' to isolate international students.", fill=TEXT_MAIN)
d3.text((115, 1400), "4. Click on any candidate name to view their full profile, resume summary, and rate card.", fill=TEXT_MAIN)
d3.text((115, 1440), "5. Open Resume Workbench (/ats/resumes) to drag-and-drop resumes and test AI parsing.", fill=TEXT_MAIN)

d3.text((80, 1680), "Pavion RTS Training Manual | Chapter 2: Candidate Directory | Page 3", fill=TEXT_MUTED)
pages.append(p3)

# =============================================================================
# PAGE 4: CRM CLIENTS, REQUISITIONS, PIPELINE & MARGIN ENGINE
# =============================================================================
p4 = Image.new('RGB', (W, H), color=LIGHT_BG)
d4 = ImageDraw.Draw(p4)

d4.rectangle([0, 0, W, 80], fill=NAVY)
d4.text((80, 25), "CHAPTER 3: CLIENTS, REQUISITIONS, SUBMISSIONS & MARGINS", fill=(255, 255, 255))

# Clients Grid
d4.text((80, 110), "Indian Enterprise Client Accounts & Active Requisitions", fill=BLUE)

client_boxes = [
    ("Tata Consultancy Services (TCS)", "ACC-TCS-101 | Edison, NJ", "REQ-IND-101: Senior AWS DevOps Architect ($110/hr bill)", "Hiring Manager: Rajesh Kulkarni (VP Delivery)"),
    ("Infosys Americas Inc.", "ACC-INF-102 | Richardson, TX", "REQ-IND-102: Lead Java Microservices Engineer ($105/hr bill)", "Hiring Manager: Amit Kapoor (Principal Architect)"),
    ("Wipro USA Technologies", "ACC-WIP-103 | East Brunswick, NJ", "REQ-IND-103: Senior Snowflake Lakehouse Architect ($120/hr bill)", "Hiring Manager: Suresh Menon (General Manager)"),
    ("HCL America Inc.", "ACC-HCL-104 | Sunnyvale, CA", "REQ-IND-104: DevOps & SRE Engineer ($95/hr bill)", "Hiring Manager: Deepa Krishnan (Director)"),
]

y_pos = 150
for c_name, c_meta, c_job, c_mgr in client_boxes:
    draw_card(d4, [80, y_pos, W - 80, y_pos + 120], fill=CARD_BG, outline=BORDER, width=2, radius=10)
    d4.rectangle([80, y_pos, 90, y_pos + 120], fill=BLUE)
    d4.text((115, y_pos + 18), c_name, fill=BLUE)
    d4.text((600, y_pos + 18), c_meta, fill=TEXT_MUTED)
    d4.text((115, y_pos + 52), c_job, fill=TEXT_MAIN)
    d4.text((115, y_pos + 82), c_mgr, fill=GREEN)
    y_pos += 140

# Margin & Pipeline Engine Card
draw_card(d4, [80, 750, W - 80, 1600], fill=CARD_BG, outline=GREEN, width=2, radius=12)
d4.text((115, 780), "FINANCIAL MARGIN CALCULATION & RTR COMPLIANCE ENGINE", fill=GREEN)

d4.text((115, 830), "1. Right-to-Represent (RTR) Lawful Consent:", fill=TEXT_MAIN)
d4.text((140, 865), "Before submitting any candidate to a US client, recruiters must lock agreed pay rate.", fill=TEXT_MUTED)
d4.text((140, 895), "Example: Rajesh Kulkarni locked at $85.00/hr C2C with exclusive e-signature consent.", fill=TEXT_MUTED)

d4.text((115, 950), "2. Automated Gross Margin & Markup Formula:", fill=TEXT_MAIN)
draw_card(d4, [140, 990, W - 140, 1070], fill=NAVY, radius=8)
d4.text((160, 1015), "Gross Margin ($/hr) = Bill Rate - Pay Rate", fill=(255, 255, 255))
d4.text((160, 1040), "Margin Percentage (%) = ((Bill Rate - Pay Rate) / Bill Rate) * 100", fill=TEAL)

d4.text((115, 1110), "3. Sample Placement Profitability Calculation:", fill=TEXT_MAIN)
d4.text((140, 1145), "• Requisition: Senior AWS DevOps Lead at TCS America (REQ-IND-101)", fill=TEXT_MUTED)
d4.text((140, 1175), "• Client Bill Rate: $110.00 / hour | Candidate Pay Rate: $85.00 / hour", fill=TEXT_MUTED)
d4.text((140, 1205), "• Hourly Spread (Gross Margin): $25.00 / hour", fill=GREEN)
d4.text((140, 1235), "• Monthly Gross Profit (160 billable hours): $4,000.00 USD / month", fill=GREEN)
d4.text((140, 1265), "• Recruiter Commission: $1,500.00 | Account Manager Commission: $2,000.00", fill=TEXT_MUTED)

d4.text((115, 1330), "4. 16-Stage ATS Funnel Stages:", fill=TEXT_MAIN)
d4.text((140, 1365), "Sourced ➔ Screening ➔ Shortlisted ➔ RTR Requested ➔ RTR Received ➔", fill=BLUE)
d4.text((140, 1395), "Internal Review ➔ Client Submitted ➔ Client Shortlisted ➔ Interview Scheduled ➔", fill=BLUE)
d4.text((140, 1425), "Technical Round 2 ➔ Final Client Round ➔ Offer Made ➔ Offer Accepted ➔ Placed!", fill=GREEN)

d4.text((80, 1680), "Pavion RTS Training Manual | Chapter 3: CRM, Requisitions & Margins | Page 4", fill=TEXT_MUTED)
pages.append(p4)

# =============================================================================
# PAGE 5: DATABASE ARCHITECTURE, PRISMA STUDIO & REST API TESTING
# =============================================================================
p5 = Image.new('RGB', (W, H), color=LIGHT_BG)
d5 = ImageDraw.Draw(p5)

d5.rectangle([0, 0, W, 80], fill=NAVY)
d5.text((80, 25), "CHAPTER 4: DATABASE EXPLORER, REST API & TROUBLESHOOTING", fill=(255, 255, 255))

d5.text((80, 110), "Inspecting Live Database & API Endpoints", fill=BLUE)

# 3 Services Cards
services = [
    ("🌐 Web Portal Application", "http://localhost:5173", "Frontend React 18 single page application with dynamic role switcher, KPI cards, and responsive tables.", BLUE),
    ("🗄️ Prisma Studio (Visual DB Explorer)", "http://localhost:5555", "Interactive visual spreadsheet interface to view, filter, edit, and inspect all 18 database tables live.", TEAL),
    ("📡 Swagger REST API Documentation", "http://localhost:5055/api-docs", "Complete OpenAPI interactive specifications testing 30+ endpoints with JWT authentication.", PURPLE),
]

y_pos = 150
for s_title, s_url, s_desc, s_color in services:
    draw_card(d5, [80, y_pos, W - 80, y_pos + 130], fill=CARD_BG, outline=s_color, width=2, radius=10)
    d5.rectangle([80, y_pos, 90, y_pos + 130], fill=s_color)
    d5.text((115, y_pos + 20), s_title, fill=s_color)
    d5.text((115, y_pos + 55), f"URL: {s_url}", fill=TEXT_MAIN)
    d5.text((115, y_pos + 90), s_desc, fill=TEXT_MUTED)
    y_pos += 155

# 18-Table ERD Mapping Summary
draw_card(d5, [80, 650, W - 80, 1200], fill=CARD_BG, outline=BORDER, width=2, radius=12)
d5.text((115, 680), "18-TABLE RELATIONAL ENTITY OVERVIEW (POSTGRESQL & SQLITE)", fill=NAVY)

d5.text((115, 730), "1. organizations: Master tenant entity, default timezone America/New_York, USD currency", fill=TEXT_MAIN)
d5.text((115, 765), "2. roles: Fine-grained permissions JSONB (['candidate:read', 'rate:view', 'submission:approve'])", fill=TEXT_MAIN)
d5.text((115, 800), "3. users: Enterprise staff members with normalized generated email for strict uniqueness", fill=TEXT_MAIN)
d5.text((115, 835), "4. accounts: Customer & MSP clients (TCS, Infosys, Wipro, HCL) with JSONB address", fill=TEXT_MAIN)
d5.text((115, 870), "5. contacts: Client hiring managers (Rajesh Kulkarni, Amit Kapoor, Suresh Menon)", fill=TEXT_MAIN)
d5.text((115, 905), "6. leads: Inbound/outbound prospective client companies with status progression", fill=TEXT_MAIN)
d5.text((115, 940), "7. opportunities: B2B deals ($185k - $240k) with win probabilities and close dates", fill=TEXT_MAIN)
d5.text((115, 975), "8. jobs (job_requisitions): Open requirements with skills arrays, bill and pay rates", fill=TEXT_MAIN)
d5.text((115, 1010), "9. candidates: 55 Indian talent profiles (Aarav, Priya, Rohan, Sneha) with visa details", fill=TEXT_MAIN)
d5.text((115, 1045), "10. candidate_documents: Resume documents with parsed JSON and tsvector search", fill=TEXT_MAIN)
d5.text((115, 1080), "11. candidate_jobs: Pipeline progression links connecting candidates to open requisitions", fill=TEXT_MAIN)
d5.text((115, 1115), "12. submissions: Profiles submitted to client hiring managers with margin calculations", fill=TEXT_MAIN)
d5.text((115, 1150), "13. placements: Closed won billable consultant starts with commission payouts", fill=TEXT_MAIN)

# Step-by-step verification
draw_card(d5, [80, 1240, W - 80, 1600], fill=CARD_BG, outline=GREEN, width=2, radius=12)
d5.text((115, 1270), "TRAINING COMPLETION & COMPLIANCE CHECKLIST:", fill=GREEN)
d5.text((115, 1320), "✔ Tested 1-click Role Switcher across SuperAdmin, Recruiter, AM, and BDE", fill=TEXT_MAIN)
d5.text((115, 1360), "✔ Verified Candidate Pool with 55 Indian tech profiles and OPT/CPT student filters", fill=TEXT_MAIN)
d5.text((115, 1400), "✔ Verified Client Accounts for TCS America, Infosys, Wipro, and HCL America", fill=TEXT_MAIN)
d5.text((115, 1440), "✔ Verified Submissions & Margin calculations ($25/hr spread = $4,000/mo gross margin)", fill=TEXT_MAIN)
d5.text((115, 1480), "✔ Inspected Database tables in Prisma Studio on http://localhost:5555", fill=TEXT_MAIN)

d5.text((80, 1680), "Pavion RTS Training Manual | Chapter 4: Database & Verification | Page 5", fill=TEXT_MUTED)
pages.append(p5)

# Save high-res multi-page PDF
pdf_path = '/Users/mac/Desktop/RTS/docs/Pavion_US_Staffing_User_Manual.pdf'
pages[0].save(pdf_path, 'PDF', resolution=150.0, save_all=True, append_images=pages[1:])
print(f"✅ Generated 5-Page User Manual PDF: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")

# Save individual page images for web viewing and embed
for idx, page in enumerate(pages):
    img_path = f'/Users/mac/Desktop/RTS/docs/images/manual_page_{idx + 1}.png'
    page.save(img_path, 'PNG')
print(f"✅ Exported {len(pages)} manual page images to docs/images/")

# =============================================================================
# GENERATE ANIMATED TRAINING VIDEO PREVIEW (GIF / WEBM)
# =============================================================================
video_frames = []
for idx, page in enumerate(pages):
    # Resize to standard 16:9 / 1080x720 frame
    frame = page.resize((960, 1357), Image.Resampling.LANCZOS)
    # Add to video sequence with hold duration
    for _ in range(6):  # ~3 seconds per slide
        video_frames.append(frame)

video_path = '/Users/mac/Desktop/RTS/docs/Pavion_Platform_Training_Video.gif'
video_frames[0].save(
    video_path,
    save_all=True,
    append_images=video_frames[1:],
    duration=500,
    loop=0
)
print(f"✅ Generated Training Video Animation: {video_path} (Size: {os.path.getsize(video_path)} bytes)")
