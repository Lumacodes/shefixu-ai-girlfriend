<div align="center">

# shefixu

**Meet Aria — a 3D AI companion that lives in your browser.**  
She talks back to you in a real voice, listens, blinks, lip-syncs, and tracks your mouse — fully local, no subscriptions.

![Preview](./docs/screenshot.png)

**👇 Click to watch the demo**

[![▶ Click here to see the demo](https://img.youtube.com/vi/YOCZ-CZZWtw/hqdefault.jpg)](https://youtu.be/YOCZ-CZZWtw)

*↑ Click the thumbnail to open on YouTube*

![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r3f-black?style=flat-square&logo=threedotjs)
![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## What is this

Aria is a browser-based 3D AI companion. You talk to her, she thinks, and she **talks back out loud** — with a real neural voice generated locally on your machine. Built with a VRM anime model, OpenRouter for the LLM, and a local Python TTS server. No ElevenLabs key, no cloud TTS fees.

Aria has:
- **Voice** — she speaks every response aloud using Microsoft's `en-US-AnaNeural` neural voice
- **Procedural idle animation** — spine breathing, arm sway, head bob. No animation clips.
- **Real-time lip-sync** — audio frequency data from Web Audio API drives mouth morph targets every frame
- **Mouse head tracking** — she looks where you look
- **Natural blinking** — randomised blink interval, smooth open/close curve
- **Voice input** — click mic, talk, she interrupts herself to listen

---

## How it's built

```
Browser
  └── React Three Fiber
        └── @pixiv/three-vrm         ← loads VRM, drives morph targets
              └── useFrame()          ← procedural animation loop (60fps)

Chat Input / Mic
  └── Web Speech API                  ← speech-to-text, browser native

AI Response
  └── fetch → OpenRouter API          ← DeepSeek V4 Flash (swappable)
        └── text → tts_server.py      ← local FastAPI
              └── edge-tts            ← Microsoft neural voices, offline
                    └── mp3 blob → Web Audio API analyser
                          └── frequency data → audioLevel → morph target
```

---

## Stack

| Layer | What |
|---|---|
| 3D rendering | React Three Fiber + `@pixiv/three-vrm` |
| UI & animations | React 19 + Framer Motion |
| LLM | [OpenRouter](https://openrouter.ai/) — DeepSeek V4 Flash |
| TTS | [`edge-tts`](https://github.com/rany2/edge-tts) via local FastAPI (`en-US-AnaNeural`) |
| STT | Web Speech API (no setup, browser native) |
| Bundler | Vite |

---

## Setup

### Prerequisites
- Node 18+
- Python 3.11+
- [OpenRouter](https://openrouter.ai/) API key (free tier works fine)

### Install

```bash
git clone https://github.com/Lumacodes/shefixu-ai-girlfriend.git
cd shefixu-ai-girlfriend
npm install
pip install edge-tts fastapi uvicorn
```

### Configure

```bash
cp .env.example .env
# add your OpenRouter key inside
```

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Add a VRM model

Put any VRM 0.x file in `public/` and name it `model.glb`.  
Free models → [VRoid Hub](https://hub.vroid.com/en)

### Run

```bash
# Terminal 1 — TTS server
python3.11 tts_server.py

# Terminal 2 — frontend
npm run dev
```

Open `http://localhost:5173`

---

## Customise

**Swap the AI model** (`src/hooks/useAI.ts`):
```ts
model: 'deepseek/deepseek-v4-flash',         // default
model: 'google/gemini-2.0-flash-lite:free',  // free
model: 'anthropic/claude-3.5-sonnet',        // premium
```

**Change the voice** (`src/hooks/useSpeech.ts`):
```ts
const VOICE = 'en-US-AnaNeural';  // any edge-tts voice
const PITCH = '+10Hz';
const RATE  = '+12%';
```
→ List all voices: `edge-tts --list-voices`

**Edit her personality** — change the system prompt in `src/hooks/useAI.ts`

---

## Project layout

```
src/
├── components/
│   ├── ChatUI.tsx       chat, voice input, interrupt
│   ├── Experience.tsx   Three.js scene — lighting, camera, grid
│   └── Model.tsx        VRM loader + all procedural animation
├── hooks/
│   ├── useAI.ts         OpenRouter fetch
│   └── useSpeech.ts     edge-tts client + Web Audio analyser
tts_server.py            FastAPI wrapper for edge-tts
```

---

## Known limitations

- Local TTS server must be running (no cloud fallback)
- VRM 1.0 not tested — use 0.x
- Lip-sync is frequency-based, not phoneme-based
- No persistent memory between sessions

---

## License

MIT — do whatever you want with it.

---

<div align="center">

Made by [Lumacodes](https://github.com/Lumacodes)

⭐ Star it if you build something with it

</div>
