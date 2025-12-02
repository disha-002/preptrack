# Product Requirements Document (PRD) — PrepTrack

## 1. Product Overview

Product Name: PrepTrack

Category: Education / Skill Assessment Platform

Developed By: Disha Agarwal

Course: B.Tech – Computer Engineering (3rd Year)

Project Type: Web Application (Full Stack)

Brief Description:
PrepTrack is a web-based platform that enables students to take mock internship and placement tests. It provides topic-based assessments (aptitude, coding, verbal) with timed, company-style formats, instant scoring, performance tracking, and analytics to help students prepare for real placement tests.


## 2. Problem Statement

Students often struggle to find free, realistic, and customizable practice tests for internships and placements. Existing solutions can be paid, inconsistent in quality, or lack features such as randomized question pools, timers, and analytics. PrepTrack addresses this gap by offering free, authentic mock tests with instant feedback and progress tracking.


## 3. Goals & Objectives

Primary goals
- Provide diverse mock tests (aptitude, coding, verbal) that simulate real placement tests.
- Deliver instant scoring and actionable feedback after each test.
- Offer clear analytics and performance trends to guide student improvement.
- Keep the UX simple and mobile-friendly for wide accessibility.

Secondary goals
- Provide an admin interface for managing question banks and test configurations (phase 2).
- Keep the platform extensible for company-specific test patterns and leaderboards.

Success criteria (high-level)
- At least 90% of users complete a test flow without confusion.
- Average session time >= 3 minutes during testing rounds.
- Zero major UI bugs detected on major device sizes in the first user testing round.


## 4. Target Audience & Personas

Primary: Undergraduate students preparing for internships and campus placements.
Secondary: Training & Placement (T&P) cells and educators who want tools to evaluate and coach students.

Persona example
- Name: Raj, 3rd year CS student
- Goal: Practice aptitude and coding under test-like conditions.
- Constraints: Limited time for preparation, prefers free resources, often uses mobile.


## 5. Key Features (Overview)

- User Authentication: Secure sign up / sign in for students.
- Dashboard: Overview of available tests, recent scores, and progress summary.
- Mock Tests: Timed tests (aptitude, coding, verbal) with navigation and review.
- Result Evaluation: Instant score, question-level feedback, and retake options.
- Admin Panel (planned): CRUD for questions, categories, and test configuration.
- Responsive UI: Mobile-friendly and accessible interfaces.


## 6. Detailed Functional Requirements

User Module
- Register and log in securely (email/password; optional OAuth in future).
- Reset password via email.
- Edit profile information.

Test Module
- List tests by category and difficulty.
- Start a test with an enforced timer, ability to navigate between questions, mark for review.
- Randomize questions from a category or question pool to reduce memorization.
- Save progress periodically (recover if connection drops).
- Submit answers and compute score automatically.

Result Module
- Compute total score, per-topic breakdown, accuracy, time per question, and recommended weak topics.
- Store test history for each user and show on dashboard.
- Allow retakes and show comparison between attempts.

Admin Module (Phase 2)
- Add / edit / delete questions with metadata (category, difficulty, tags, answer choices, correct answer, explanation).
- Create test templates (time limit, number of questions, category weights).
- Export results (CSV) for T&P usage.

Security & Data
- Store passwords hashed (bcrypt or equivalent).
- Protect APIs with authentication (JWT/session) and role-based guards for admin routes.
- Validate all inputs server-side.


## 7. Non-Functional Requirements

Usability
- Clean, student-friendly UI; accessible color contrast and screen-reader friendly structure.

Performance
- Page loads under 2 seconds on average network conditions.
- Test submission and scoring should return results within 2s for typical test sizes.

Scalability
- Design to scale horizontally (stateless servers, DB with indexes for results/questions).

Reliability
- Graceful handling of network interruptions (client-side autosave + server idempotency).

Security
- Secure storage of credentials, data-at-rest protections for DB access, and HTTPS for all endpoints.

Maintainability
- Clear code separation (components, services, API), tests for core flows.


## 8. System Architecture (High-level)

Frontend
- React.js (functional components + hooks)
- React Router for navigation
- CSS modules or a design system (Tailwind/CSS-in-JS optional)

Backend
- Node.js with Express.js (or Next.js API routes if migrating frontend)
- RESTful JSON APIs (or GraphQL in future)

Database
- MongoDB for storing users, question bank, and test results

Other
- Authentication: JWT
- Hosting: Vercel/Netlify for frontend, Heroku/DigitalOcean/AWS for backend (student project: deploy to free/personal tier)

Flow
User → Login → Dashboard → Select Test → Attempt → Submit → View Results


## 9. Data Model (Sketch)

Collections (MongoDB)
- users
  - _id, name, email, passwordHash, role, createdAt, updatedAt
- questions
  - _id, text, choices[], correctAnswer, explanation, category, difficulty, tags[], createdBy, createdAt
- tests (test templates)
  - _id, name, categories[], numQuestions, timeLimitSeconds, description, createdAt
- attempts
  - _id, userId, testId, responses[{questionId, selected, correct, timeSpent}], score, accuracy, startedAt, submittedAt

Indexes
- questions: index on category, difficulty, tags
- attempts: index on userId, testId, startedAt


## 10. API Sketch (initial)

Auth
- POST /api/auth/register {name,email,password}
- POST /api/auth/login {email,password} -> { token }
- POST /api/auth/forgot-password {email}

Tests & Questions
- GET /api/tests -> list templates
- GET /api/tests/:id -> test details (question IDs only)
- POST /api/tests/:id/start -> returns randomized question set + attemptId
- POST /api/attempts/:attemptId/submit {responses[]} -> compute score, store results
- GET /api/users/:userId/attempts -> list attempts for dashboard

Admin (planned)
- POST /api/questions
- PUT /api/questions/:id
- DELETE /api/questions/:id

Notes
- All protected routes require a valid JWT in Authorization header.


## 11. User Flows & Wireframes (brief)

1) New user sign-up
- Landing -> Sign up (email) -> Confirm -> Dashboard

2) Take test
- Dashboard -> Select category/test -> Start -> Timer visible -> Navigate questions -> Submit -> Results

3) View results
- Result page: score, per-topic breakdown, time per question, explanations, suggested topics to practice

Wireframes
- Suggest building low-fidelity wireframes for: Landing, Login, Dashboard, Test Runner, Result page, Admin CRUD.


## 12. User Stories (refined)

- US-01 (High) As a student, I can register and log in so I can take tests.
- US-02 (High) As a student, I can take timed mock tests and navigate questions.
- US-03 (High) As a student, I can receive instant score and per-question feedback.
- US-04 (Medium) As a student, I can view performance trends across attempts.
- US-05 (Medium) As an admin, I can manage question banks and test templates.


## 13. Acceptance Criteria & Tests (measurable)

Happy path (Test attempt)
- Given an authenticated student, when they start a test and submit answers, then the system returns a scored result within 2 seconds and stores the attempt.

Edge cases
- If the user’s connection drops during a test, partial progress must be saved and recoverable on re-login.
- Tests must enforce time limits: submissions after expiry are either auto-submitted or rejected consistently.
- Prevent duplicate submissions for the same attempt (idempotency).

QA checks
- Unit tests for scoring function and timer boundary conditions.
- Integration test: start -> attempt -> submit -> verify stored attempt with correct score.


## 14. Metrics & Analytics

Primary metrics
- Completion rate of started tests
- Average score by category
- Retake frequency per user
- Time spent per question

Secondary
- Session length, DAU/WAU for student users, feature usage (which tests are most used)


## 15. Timeline & Milestones (Academic Example)

Phase 1 — Weeks 1–4: Core MVP
- Week 1: Requirements, PRD, SRS, wireframes
- Weeks 2–3: Frontend components (Login, Dashboard, Test Runner basics)
- Week 4: Backend APIs (Auth, Test start/submit), DB models, local integration

Phase 2 — Weeks 5–7: Enhancements
- Week 5: Result pages, analytics, history
- Week 6: Autosave/connection resilience and test navigation
- Week 7: Admin interface (basic), final polish

Phase 3 — Week 8: Testing & Delivery
- Buffer for bug fixes, demo, and documentation


## 16. Risks & Mitigations

- Risk: Permission issues on deployment (global installs) — Mitigation: Use containerized or user-level managers (nvm) and documented setup steps.
- Risk: Data loss during network interrupts — Mitigation: Autosave answers every N seconds and server-side idempotency.
- Risk: Inaccurate scoring due to race conditions — Mitigation: Score on server, treat client as untrusted.


## 17. Open Questions / Assumptions

Assumptions
- MVP uses email/password auth; OAuth is optional future work.
- Admin features are phase 2.
- MongoDB is acceptable for flexible question schemas.

Open questions
- Do you want company-specific templates in phase 1 or later?
- Will there be any paid features or is everything free?


## 18. Next Steps (recommended)

- Create repository tasks (issues) for: Auth, Test Runner, Scoring, DB models, Dashboard, Result Page, Admin CRUD.
- Produce low-fidelity wireframes for core pages.
- Define a minimal seed dataset of ~50 questions across categories to validate flows.
- Set up development environment doc (README) and preferred Node version manager (nvm/volta).


## 19. References

- MDN Web Docs (HTML, CSS, JS)
- React.js Official Docs
- Node.js & Express.js Guides
- MongoDB Documentation


---

Prepared for: PrepTrack — initial PRD
Author: Disha Agarwal
Date: 2025-11-13

