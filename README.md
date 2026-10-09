# TrustLens — See Beyond the Headlines

**TrustLens** is a complete, full-stack misinformation analysis and news verification platform. It helps citizens, researchers, and journalists assess the credibility of online claims, forwarded WhatsApp/Telegram messages, and digital screenshots through explainable linguistic indicators, traceable primary-source evidence, community deliberation, and accredited expert review.

> **Core Principle:** TrustLens assists human judgment rather than replacing it. Automated models evaluate linguistic framing and corroborated archives, but never claim that AI can definitively prove ground truth for every claim.

---

## 1. Key Platform Capabilities

1. **Multimodal Claim Verification:** Analyze raw text, upload image screenshots for OCR extraction (powered by Tesseract.js), or enter web article URLs with SSRF protection.
2. **Explainable Risk Indicators:** Deterministic evaluation of urgency pressure, hyperbolic tone, fear-inducing wording, capitalization clusters, and attribution gaps with transparent limitations.
3. **Traceable Evidence Discovery:** Direct corroboration or debunking against authenticated fact-checking archives (PIB Fact Check, Reuters, ISRO, WHO) and live news references.
4. **Multilingual Architecture:** Native support and script detection for English, Telugu (తెలుగు), and Hindi (हिन्दी).
5. **Contextual AI Verification Assistant:** Interactive assistant explaining indicators, summarizing evidence, and clarifying uncertainties. Powered by Google Gemini with an explainable offline fallback engine.
6. **Community Deliberation & Peer Voting:** Public claims feed with helpfulness voting, comment threads, and evidence links.
7. **Accredited Expert Review Network:** Directory of verified forensics specialists, investigative reporters, and regional linguists with casework tracking.
8. **Citizen Report Center:** Direct, verified access to statutory reporting channels including the National Cyber Crime Reporting Portal (1930) and PIB Fact Check WhatsApp Helpline.
9. **Law & Citizen Rights Hub:** Educational summaries of Article 19(1)(a) speech protections, BNS 2023 Section 353(2), and IT Act Section 66D.
10. **Digital Literacy Academy:** Interactive modules on reverse image search, cheapfakes, and source evaluation with interactive quizzes and progress tracking.
11. **Comprehensive Admin Panel:** System integration telemetry (DB, OCR, Gemini, Storage), user role management, moderation triage, and audit logs.
12. **Privacy Compliance (DPDP & GDPR):** Full data export in JSON and permanent account deletion.

---

## 2. Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion.
* **Backend:** Node.js 24, Express, TypeScript, Zod schema validation.
* **Database:** Dual-mode architecture:
  * Local Zero-Config Engine: Built-in `node:sqlite` persistent database (`server/data/trustlens.db`).
  * Production Cloud: Supabase PostgreSQL with versioned migrations (`supabase/migrations/20261010000000_trustlens_initial_schema.sql`).
* **Authentication:** JWT session management with Supabase Auth compatibility and 1-click test account switching.
* **OCR Service:** Tesseract.js supporting English (`eng`), Hindi (`hin`), and Telugu (`tel`).
* **AI Provider:** Google Gemini API (`gemini-1.5-flash`) with transparent deterministic fallback engine when API keys are not supplied.
* **Security:** Strict SSRF guard blocking private IP ranges (RFC 1918, RFC 3927, loopbacks) and credentialed URLs.

---

## 3. Quick Start & Local Development

### Prerequisites
* Node.js v20+ or v24+
* npm v10+

### Installation

Clone and install dependencies:
```bash
# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### Running Locally

To run both backend API (Port 5000) and frontend Vite server (Port 3000) concurrently:
```bash
npm run dev
```

* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:5000/api/health`

### Pre-Configured Test Accounts (1-Click Login)
On the `/login` page, you can use the instant test account pills or manually enter:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Senior Analyst** | `analyst@trustlens.org` | `trustlens123` | Run multimodal analyses, save reports, participate in community |
| **Administrator** | `admin@trustlens.org` | `trustlens123` | Access Admin Panel, system health telemetry, user roles, moderation |
| **Forensics Expert** | `dr.sharma@trustlens.org` | `trustlens123` | Expert review casework, evaluate claims, submit specialist verdicts |

---

## 4. Environment Variables

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend Express port | `5000` |
| `JWT_SECRET` | Secret key for signing session tokens | `trustlens-default-dev-secret-key-2026` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | *Uses deterministic engine if omitted* |
| `SUPABASE_URL` | Supabase project URL (optional) | *Uses local SQLite if omitted* |
| `SUPABASE_ANON_KEY` | Supabase anon key (optional) | *None* |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (optional) | *None* |

---

## 5. Running Automated Tests

Run the backend and frontend automated test suites:
```bash
# Run server test suite (14 unit & integration tests)
npm --prefix server test

# Run client unit test suite
npm --prefix client test
```

### Test Coverage Highlights
* **Linguistic Heuristics:** Multilingual urgency detection (English, Telugu, Hindi), sensationalism scoring, and risk score boundaries.
* **SSRF Protection:** Rejection of private subnets (127.0.0.1, 10.x, 192.168.x, 169.254.x) and invalid protocols.
* **API Endpoints:** Verification pipeline execution, statutory reporting channels, and educational progress.

---

## 6. Supabase Deployment & Cloud Database

To deploy to Supabase PostgreSQL:
1. Create a project in [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. Copy and run the schema migration in:
   `supabase/migrations/20261010000000_trustlens_initial_schema.sql`
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment.

---

## 7. Production Build

To compile both client and server for production deployment:
```bash
npm run build
```
* Client output: `client/dist/`
* Server output: `server/dist/`
