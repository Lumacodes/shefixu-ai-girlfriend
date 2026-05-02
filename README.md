# shefixu

A 3D AI companion that lives in your browser. She talks, listens, blinks, tracks your mouse, and lip-syncs in real time. Built with React Three Fiber and a VRM anime model — no cloud TTS, no subscriptions, runs fully local.

![Preview](./docs/screenshot.png)

## 🎬 Demo

[![Watch the demo on YouTube](https://img.youtube.com/vi/YOCZ-CZZWtw/hqdefault.jpg)](https://youtu.be/YOCZ-CZZWtw)

---

## How it works

The app is split into three layers that talk to each other:

**1. The brain** — every message goes to [OpenRouter](https://openrouter.ai/) which routes it to DeepSeek V4 Flash. The system prompt gives her a personality and keeps responses short and natural. Swap the model to anything on OpenRouter without touching anything else.

**2. The voice** — responses get stripped of emojis and markdown, then sent to a local FastAPI server (`tts_server.py`) which calls the [`edge-tts`](https://github.com/rany2/edge-tts) Python library. Audio comes back as an mp3 blob, gets loaded into a Web Audio API analyser node, and the frequency data drives the lip-sync frame by frame.

**3. The model** — a VRM file loaded via `@pixiv/three-vrm`. Every frame (`useFrame`) the code reads `audioLevel`, lerps the `aa` morph target for mouth open/close, runs a blink timer, sways the spine and arms, and rotates the head/neck toward the mouse cursor. No animation clips — all procedural.

---

## Stack

| | |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| 3D | React Three Fiber + `@pixiv/three-vrm` |
| Animations | Framer Motion (UI) + procedural `useFrame` (character) |
| LLM | OpenRouter → DeepSeek V4 Flash |
| TTS | `edge-tts` → FastAPI → Web Audio API |
| STT | Web Speech API (browser native, no setup) |

---

## Setup

### Prerequisites
- Node 18+
- Python 3.11+
- An [OpenRouter](https://openrouter.ai/) API key (free tier works)

### Install

```bash
git clone https://github.com/Lumacodes/shefixu-ai-girlfriend.git
cd shefixu-ai-girlfriend
npm install
pip install edge-tts fastapi uvicorn
```

### Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Add your VRM model

Drop any VRM 0.x model into `public/` and name it `model.glb`. Free models at [VRoid Hub](https://hub.vroid.com/en). The character included in the demo is **Alicia Solid**.

### Run

Terminal 1 — TTS server:
```bash
python3.11 tts_server.py
# → http://127.0.0.1:8000
```

Terminal 2 — frontend:
```bash
npm run dev
# → http://localhost:5173
```

---

## Customisation

**Change the AI model** — edit `src/hooks/useAI.ts`:
```ts
model: 'deepseek/deepseek-v4-flash',        // current
model: 'google/gemini-2.0-flash-lite:free', // free alternative
model: 'anthropic/claude-3.5-sonnet',       // higher quality
```

**Change the voice** — edit `src/hooks/useSpeech.ts`:
```ts
const VOICE = 'en-US-AnaNeural'; // any edge-tts voice
const PITCH = '+10Hz';           // higher = more anime-ish
const RATE  = '+12%';            // speaking speed
```

List all available voices: `edge-tts --list-voices`

**Change her personality** — edit the `content` field in `src/hooks/useAI.ts`. That's the system prompt.

---

## Project structure

```
src/
├── components/
│   ├── ChatUI.tsx      # chat UI, voice input, interrupt logic
│   ├── Experience.tsx  # Three.js scene — lighting, camera, grid
│   └── Model.tsx       # VRM loader, procedural animation, lip-sync
├── hooks/
│   ├── useAI.ts        # OpenRouter fetch
│   └── useSpeech.ts    # edge-tts client + Web Audio analyser
tts_server.py           # FastAPI wrapper around edge-tts
public/
└── model.glb           # VRM model — not included, add your own
```

---

## Known limitations

- TTS requires the local Python server to be running — no fallback to browser speech in production
- VRM 1.0 models aren't tested (only 0.x)
- Lip-sync is audio-frequency based, not phoneme-based — looks good but isn't exact
- No conversation memory beyond the current session

---

## License

MIT
