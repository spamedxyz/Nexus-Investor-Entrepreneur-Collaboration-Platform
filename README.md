# Nexus — Premium Investor & Entrepreneur SaaS Engine

Nexus is a premium full-stack venture collaboration platform designed to connect startup founders with accredited investors. It features JWT-based role authorization, a conflict-detecting interactive briefing scheduler, full-screen WebRTC video rooms, e-signable legal documents, simulated Stripe ledgers, instant chat, admin audits, and an AI Matchmaker powered by Google's Gemini 3.5.

---

## 🎨 Design Philosophy: Cosmic Slate

Nexus operates on a modern, high-contrast **Cosmic Slate Theme** utilizing Inter and monospace typography with generous spacing:

- **Typography**: Paired Space Grotesk/Inter headers with JetBrains Mono code and indicator accents.
- **Micro-Animations**: Clean fade-in transitions, layout-reactive loading states, and dynamic volume waveforms during WebRTC sessions.
- **Architectural Honesty**: Zero artificial metadata overlays or mock logs. Human-friendly, clear action menus without clutter.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons, Motion animations.
- **Backend**: Node.js, Express, tsx (Typescript Execution), CJS build bundling via esbuild.
- **Database**: Local JSON State Engine (`local_db.json`) with resilient automatic load/save.
- **AI Integration**: Server-side Google Gemini 3.5 SDK (`@google/genai`) for startup evaluations.
- **Tests**: Native Node.js test runner (zero external test dependencies).

---

## 💾 Core Database Models

All entities are defined within `src/types.ts` and synced securely to `local_db.json`:

```typescript
export interface User {
  id: string;
  email: string;
  role: UserRole; // 'admin' | 'investor' | 'entrepreneur'
  createdAt: string;
}

export interface Profile {
  userId: string;
  name: string;
  avatar: string;
  bio: string;
  industry: string;
  skills: string[];
  experience: string;
  // Entrepreneur specifics
  startupName?: string;
  startupDescription?: string;
  fundingStage?: string;
  fundingGoal?: number;
  fundingRaised?: number;
  // Investor specifics
  totalInvested?: number;
  investmentsCount?: number;
  preferredStages?: string[];
  preferredIndustries?: string[];
}

export interface Meeting {
  id: string;
  requesterId: string;
  receiverId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // in minutes
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  videoRoomId: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'investment';
  amount: number;
  targetName?: string;
  reference: string;
  createdAt: string;
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
Define your local Gemini API Key in a `.env` file at the root:
```env
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-custom-jwt-secret
```

### 2. Dependency Setup
Install all packages defined inside `package.json`:
```bash
npm install
```

### 3. Development Server
Start the Express backend and the Vite frontend middleware concurrently on port `3000`:
```bash
npm run dev
```

### 4. Running the Test Suite
Trigger the native integration tests verifying registration, login, session validity, and health endpoints:
```bash
npm run test
```

### 5. Production Compilations
Build the production-ready client static directory and bundle the backend typescript file into a optimized CJS bundle:
```bash
npm run build
npm run start
```

---

## 🐳 Containerization & Orchestration

### Build Docker Container
```bash
docker build -t nexus-platform:latest .
```

### Run Docker Container
```bash
docker run -p 3000:3000 --env-file .env nexus-platform:latest
```

### Kubernetes Deployment
Deploy the high-availability replication controllers on Kubernetes (defined inside `k8s-deployment.yaml`):
```bash
kubectl apply -f k8s-deployment.yaml
```

---

## 📂 API Reference & Postman

A comprehensive list of backend API routes:

- **Authentication**:
  - `POST /api/auth/register` (Register accounts)
  - `POST /api/auth/login` (Create session and return JWT token)
  - `GET /api/auth/me` (Fetch profile/wallet)
- **Collaboration**:
  - `GET /api/profiles` (Search and filter investors/founders)
  - `POST /api/meetings` (Request meetings with overlap conflict checking)
  - `POST /api/meetings/:id/status` (Accept or decline a meeting invitation)
  - `POST /api/rooms/:roomId/signals` (WebRTC fallback REST signaling loop)
- **Financial Ledgers**:
  - `GET /api/wallet/transactions` (Get complete transaction history)
  - `POST /api/wallet/deposit` (Deposit simulated funds through Stripe sandbox)
  - `POST /api/wallet/transfer` (Deploy direct venture capital investments)
- **AI Intelligence**:
  - `POST /api/ai/match` (Trigger Gemini 3.5 evaluating startup readiness)

> **Developer Note**: Imports the pre-configured Postman Collection file `nexus.postman_collection.json` or consult the OpenAPI 3.0 descriptor `openapi.yaml` for complete parameters.
