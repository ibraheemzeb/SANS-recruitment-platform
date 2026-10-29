# SANS AI Screening & Virtual Assessment Platform (RFQ3358)
### Saudi Air Navigation Services (شركة خدمات الملاحة الجوية السعودية)

A mission-critical, bilingual (Arabic & English) AI-powered Candidate Screening, Job Requisition Management, and Interactive Virtual Interview platform purpose-built for the Saudi Air Navigation Services (SANS).

---

## 🚀 Key Features & Architectural Capabilities

### 1. Multi-Persona Role-Based Access Control (RBAC)
Adaptive enterprise interface with distinct operational views and workflows for 7 key aviation personas:
- **Senior Recruiter (Sarah Al-Harbi)**: Live recruitment pipeline, bulk CV ingestion, AI radar match ranking, and human override oversight.
- **ATC Operations Manager (Capt. Tariq Al-Ghamdi)**: Departmental review, side-by-side ATC radar competency comparison, committee approvals.
- **HR Administrator (Sara Al-Ghamdi)**: Job requisition creation & publishing, scoring weight policy baseline, SLA escalation thresholds, and subsidiary tenant rules (SANS Core, NERA, SACA Academy).
- **Assessment Specialist / Reviewer (Dr. Faisal Al-Harthi)**: Interview rubric banks, Mercer cognitive assessments, speech & phraseology verbatim analysis.
- **Compliance & Governance Auditor (Mona Al-Shehri)**: PDPL & NCA ECC audit trails, data residency verification, human-in-the-loop oversight logs.
- **Candidate Self-Service (Mohammad Al-Zahrani)**: Job catalog exploration, GACA licensing criteria review, instant application submission, and interactive AI voice interview.
- **IT Systems Administrator (Eng. Omar Al-Otaibi)**: Oracle Fusion HCM REST API gateway (`/recruitingJobRequisitions`), zero-trust security keys, backup drill & RPO/RTO monitors.

### 2. Job Requisition & Career Portal Management
- **HR Job Publishing**: HR Administrators can post new air navigation requisitions using pre-configured GACA templates (Tower ATC, Approach Radar, CNS/ATM Radar Engineers, Unmanned Aircraft UTM Specialists, Aeronautical Cybersecurity Analysts) or custom specifications.
- **Instant Candidate Visibility**: Published jobs appear in real-time in the candidate job catalog with "Newly Posted" status badges.
- **Automated AI Interview Rubric Generation**: Automatically synthesizes tailored situational and technical interview scenarios for new openings.
- **Oracle Fusion HCM Integration**: Broadcasts requisition sync payloads to Oracle Cloud HCM REST endpoints.

### 3. Interactive AI Virtual Interview Room
- **Voice & Text Modes**: Dual-channel interview experience with real-time speech synthesis (animated avatar voice) and microphone recording.
- **Speech Phraseology Analysis**: Evaluates ICAO Annex 11 standard phraseology discipline, speech clarity, and emergency protocol handling.
- **Instant Rubric Scoring**: Scores candidates against multi-dimensional competency rubrics.

### 4. Enterprise Compliance & Governance
- **Saudi PDPL Compliance**: Explicit candidate data processing consent and secure storage.
- **NCA ECC-1:2018 Alignment**: Complete audit trail of every recruiter score override, application submission, and external sync event.
- **Saudi National Identity Integration**: Integrated Nafath digital authentication simulation.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS with tailored SANS corporate aviation green palette and dark accents
- **Audio & Voice**: Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`)
- **Icons**: Lucide React
- **State Management**: React Context with persistent `localStorage` synchronization

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone git@github.com:ibraheemzeb/SANS-recruitment-platform.git
cd SANS-recruitment-platform

# Install dependencies
npm install
```

### Development
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### Production Build
```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🏛️ SANS Corporate Identity & Aviation Standards
- **GACA Compliance**: Aligned with General Authority of Civil Aviation Licensing Part 171/172.
- **ICAO Alignment**: ICAO Annex 1 & Annex 11 language proficiency requirements.
- **Saudi Data Hosting**: Tailored for in-kingdom sovereign cloud infrastructure.
