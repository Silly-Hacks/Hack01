# Us Among AI

**A reverse Turing test where YOU try to pass as a machine.**

> *You've heard of Among Us. Us Among AI — exactly what you're thinking.*

Built in 12 hours at [SillyHacks 2026](https://sillyhacks-2026.devpost.com/) (SFU Surge × MLH Hack Days) — **Winner: Best UI** 🏆

<img width="1558" height="901" alt="Us-Among_AI_hero" src="https://github.com/user-attachments/assets/0999bec0-25b7-4502-9dfd-1d60ad8335e4" />
<img width="1920" height="994" alt="Us-Among_AI_interface" src="https://github.com/user-attachments/assets/300f81ad-2283-494c-bd56-6dd22c61cad1" />
<img width="1920" height="994" alt="Us-Among_AI_analyzing_human_behavior" src="https://github.com/user-attachments/assets/3aa98b4d-bff4-4cae-acc5-d4a3f14ca502" />

## What Is This

You're placed in a sandbox environment where your only job is to **pretend to be an AI**. Complete objectives. Sounds straightforward — except while you're doing them, you're thrown CAPTCHA prompts designed *against* humans, not for them. Fail, and you're flagged as human. Game over. You're out.

AI is everywhere. We're at the inflection point where the question isn't "can AI pass as human" anymore — it's **can humans convincingly act like machines?**

That's the real game.

<img width="1920" height="994" alt="Us-Among_AI_analyzing_Flagged" src="https://github.com/user-attachments/assets/78b33319-6159-4485-85c4-784408dd8a3a" />
<img width="1920" height="994" alt="Us-Among_AI_analyzing_tasks" src="https://github.com/user-attachments/assets/89f46039-92d9-4109-986b-c34230d32e01" />
<img width="1920" height="994" alt="Us-Among_AI_analyzing_Task2" src="https://github.com/user-attachments/assets/112e2056-6fa8-4654-a9ee-89a3259869d6" />


## The Tasks

Players navigate a retro-futuristic server room as `AGENT_404` and interact with task stations. Each one is a behavioral trap — the rules sound simple, but your human instincts are exactly what gets you caught.

| Station | Task | The Trap |
|---------|------|----------|
| 🟠 **Audio Plinth** | Listen to a 3-note sequence, recall the notes | Must respond within 1.5s — too slow and you're flagged |
| 🟣 **Holographic Plinth** | Solve Tower of Hanoi at a metronomic pace | Pause to think? `THINKING PAUSE DETECTED` — bots move with perfect rhythm |
| 🔵 **Retro-Terminal** | Type a word backwards without hesitation | Backspace = instant fail. Take > 2s to start = `PROCESSING LATENCY EXCEEDED` |
| 🟢 **Sorting Console** | Arrange numbers in ascending order | Rhythm and precision tracked — wrong hesitation timing and the bar climbs |

Every correction, every pause, every rhythm hiccup — the **Auditor** sees it all.

## Gemini — The Audit Engine

This isn't Gemini as a chatbot. This is **Gemini as an audit engine** — processing raw telemetry and making live gameplay decisions.

**How it works:**
- Dedicated API endpoints wired to each task
- Every 30 seconds: your inputs, movement, and timestamps get packaged and pushed to Gemini
- Gemini analyzes your behaviour, scores your humanness, and updates a **live suspicion bar** in real time
- Built-in human error tolerance — Gemini isn't looking for perfection, it's looking for **patterns**

Too slow reversing a word? Suspicious. Fixed a typo? Flagged. Wrong hesitation timing on a keypress? The bar climbs. Gemini catches all of it.

The `AIEvaluator` service receives raw keystroke timing data, sends it to Gemini 1.5 Flash, and gets back a humanness score (0–100) with clinical reasoning — feeding directly into the gameplay loop.


## The Verdict

After all tasks, the system aggregates your suspicion score, task performance, and behavioral metrics into a final verdict:

- **ACCEPTED — AS ARTIFICIAL INTELLIGENCE** → you fooled the system
- **FLAGGED — AS HUMAN** → access denied

The verdict screen reveals your AI Similarity Score with a line-by-line analysis: which behaviours triggered flags, which tasks you failed, and why. Each line types in sequentially — because even the reveal should feel like a machine is processing you.

## Architecture

```
Us-Among-AI/
├── frontend/                    # Next.js 16 + React 19 + TypeScript
│   ├── components/game/
│   │   ├── landing-screen       # Boot sequence, typed init text, task preview
│   │   ├── game-room            # Server room — WASD navigation, interactive stations
│   │   ├── game-hud             # Live suspicion meter + AI observation log
│   │   ├── mini-tasks           # Vinyl, Hanoi, Typewriter, Sorting task modals
│   │   └── verdict-screen       # Analysis animation + behavioral report
│   └── lib/
│       └── game-store.ts        # Zustand — state, metrics, 11 behavioral signals
│
└── backend/                     # Express + Socket.IO + Gemini
    └── src/
        ├── server.ts            # WebSocket server, player events, evaluation triggers
        ├── logic/
        │   └── PlayerManager.ts # Player state, keystroke buffer (last 50), suspicion calc
        └── services/
            └── AIEvaluator.ts   # Gemini 1.5 Flash — humanness scoring from raw telemetry
```

**State management:** Zustand at 60fps game-loop speed — tracking player position, suspicion level, task sequencing, and 11 behavioral metrics (key timings, typing bursts, corrections, movement smoothness, hesitations, over-precision, backspace attempts, thinking pauses, response latencies).

**Real-time pipeline:** Socket.IO streams keystroke data → Express backend buffers → Gemini evaluates → suspicion score updates live.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, oklch neon color system, tw-animate-css |
| State | Zustand 5 |
| UI | Radix UI, shadcn/ui |
| Audio | Web Audio API (raw oscillators) |
| Backend | Express 5, Socket.IO 4 |
| AI | Gemini 1.5 Flash via `@google/generative-ai` |
| Deploy | Vercel |

## Design

Retro-futuristic server room aesthetic — scanline overlays, neon glows (cyan / pink / orange / green), a fully custom oklch dark color system, and Geist Mono throughout. Custom CSS animations: scan-lines, text flicker, typing cursor, per-color glow classes. The cyber-grid background uses a 40px repeating gradient.

The design philosophy: **the interface should make you feel observed.** A live suspicion meter. A ticking task counter. An AI observation log narrating your every move in cold, clinical language. The tension isn't in the tasks — it's in knowing you're being watched.

## What's Next

The core architecture scales horizontally — more rooms, more tasks, more telemetry, same pipeline. The roadmap:

- **More detection vectors** — mouse path analysis, scroll behaviour, facial expressions. Every human micro-habit is a detection vector, all feedable into Gemini.
- **Multiplayer** — one player becomes the live Gemini auditor, judging another player in real time. The most chaotic PvP concept we've ever considered.
- **Adaptive difficulty** — Gemini learns your patterns across runs and gets harder to fool.
- **Leaderboards** — global rankings by AI similarity score.
- **Enterprise applications** — the same behavioral analysis pipeline applies to fraud detection, bot onboarding, and behavioral verification at scale.

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key → [get one here](https://aistudio.google.com/apikey)

### Setup

```bash
git clone https://github.com/Silly-Hacks/Us-Among-AI.git
cd Us-Among-AI

# Backend
cd backend
npm install
echo "GOOGLE_API_KEY=your_key_here" > .env
npm run dev  # :3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # :3000
```

## The Team

| Name | Role |
|------|------|
| **Kashfi Pranta** · [@KashfiRashid](https://github.com/KashfiRashid) | Designer & Developer |
| **Brett Rodrigues** | Developer |
| **Tawheed Sarker Aakash** | Developer |
| **Sadab Khan** | Developer |

## Links

- **[Devpost](https://devpost.com/software/us-among-ai)** · **[SillyHacks 2026](https://sillyhacks-2026.devpost.com/)**

---

*The AI isn't the enemy. Your own instincts are.*

*Built at SillyHacks 2026. We did not sleep. April Fools' on you, biology.*<img width="1558" height="901" alt="Us-Among_AI_hero" src="https://github.com/user-attachments/assets/144c35ae-7623-4313-aded-2daf60946465" />
