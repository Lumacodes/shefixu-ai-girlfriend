<div align="center">

# 🧠 shefixu — Your AI Girlfriend Lives in Your Browser Now

### *She talks. She listens. She lip-syncs. She blinks. She follows your eyes. And she runs 100% on your machine.*

<br/>

> **Built from light and code — an open-source 3D companion that makes the past feel like dial-up.**

<br/>

![Preview](./docs/screenshot.png)


## 👇 See it in action before you read another word

[![Demo](https://img.shields.io/badge/🎬-View_Demo-FF5E5B?style=for-the-badge&logo=github&logoColor=white)]([https://your-demo-link.com](https://youtu.be/YOCZ-CZZWtw))

*From HN headline to published LinkedIn post — all from your phone, in seconds.*




[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js / R3F](https://img.shields.io/badge/Three.js-R3F-black?style=flat-square&logo=threedotjs)](https://r3f.docs.pmnd.rs/)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)
[![Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/lumacodes)

</div>

---

## ⚡ What you're looking at

**Aria** is a fully animated 3D anime avatar that:

- 🗣️ **Speaks back to you** — in a real Microsoft neural voice, generated offline, on your GPU
- 👂 **Hears you** — press mic, talk, she listens and responds
- 👄 **Lip-syncs in real time** — every syllable, every frame, driven by raw audio frequency analysis
- 👀 **Watches you** — her head tracks your mouse like she's actually paying attention
- 😮‍💨 **Breathes, sways, blinks** — fully procedural idle animation. No animation clips. Pure math.
- 🧠 **Thinks with a frontier LLM** — DeepSeek, Gemini, Claude, GPT-4o — your choice, one line of code
- 💸 **Costs you nothing** — local TTS, free-tier LLM, zero subscriptions

**This is not a chatbot with a face pasted on it.** Every system — voice, motion, lip-sync, attention — is wired together in a real-time 60fps loop.

---

## 🔥 Why people are obsessing over this

Most "AI companion" projects are:
- A chat window with an avatar image
- Cloud-dependent, expensive, or both
- Impossible to customise without a PhD

**shefixu is none of that.**

It's a fully local, fully open, fully hackable 3D AI companion you can run on your laptop *right now*. Change her personality in one file. Swap her voice in two lines. Give her a different face by dropping a new VRM file into `/public`. Make her speak Japanese. Make her a therapist. Make her a pirate. She doesn't care — you're in control.

---

## 🏗️ How it actually works

```
You speak →  Web Speech API (browser-native, zero setup)
                  ↓
         OpenRouter LLM API (DeepSeek / Claude / GPT-4o)
                  ↓
         tts_server.py  →  edge-tts  →  Microsoft neural voice (offline)
                  ↓
         Web Audio API frequency analyser
                  ↓
         VRM mouth morph targets  →  real-time lip-sync  →  60fps
```

Every frame, the animation loop reads audio frequency data and drives Aria's mouth, spine, arms, and head simultaneously. It's the same technique AAA games use — just in a browser tab.

---

## 🛠️ Full tech stack

| What | How |
|---|---|
| 3D avatar rendering | [React Three Fiber](https://r3f.docs.pmnd.rs/) + [`@pixiv/three-vrm`](https://github.com/pixiv/three-vrm) |
| Animations | 100% procedural — `useFrame()` loop, no clips |
| LLM brain | [OpenRouter](https://openrouter.ai/) — swap any model in 1 line |
| Voice (TTS) | [`edge-tts`](https://github.com/rany2/edge-tts) — Microsoft `en-US-AnaNeural`, runs **fully offline** |
| Mic input (STT) | Web Speech API — browser-native, nothing to install |
| Lip-sync | Web Audio API frequency → VRM morph targets, every frame |
| UI & transitions | React 19 + Framer Motion |
| Bundler | Vite |

---

## 🚀 Get her running in under 5 minutes

### What you need

- Node 18+
- Python 3.11+
- A free [OpenRouter](https://openrouter.ai/) account (takes 30 seconds to sign up)

### Step 1 — Clone & install

```bash
git clone https://github.com/Lumacodes/shefixu-ai-girlfriend.git
cd shefixu-ai-girlfriend
npm install
pip install edge-tts fastapi uvicorn
```

### Step 2 — Paste your API key

```bash
cp .env.example .env
```

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Step 3 — Drop in a VRM model

Grab any free VRM 0.x model from [VRoid Hub](https://hub.vroid.com/en), place it in `public/`, rename it `model.glb`. Done.

### Step 4 — Start it

```bash
# Terminal 1
python3.11 tts_server.py

# Terminal 2
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and say hello.

---

## 🎛️ Make her yours

### Give her a different brain

`src/hooks/useAI.ts` — swap in any OpenRouter model:

```ts
model: 'deepseek/deepseek-v4-flash',         // 🔥 default — blazing fast & free
model: 'google/gemini-2.0-flash-lite:free',  // 🆓 another free option
model: 'anthropic/claude-3.5-sonnet',        // 🧠 highest quality conversations
model: 'openai/gpt-4o',                      // 🏆 the classic
```

### Give her a different voice

`src/hooks/useSpeech.ts`:

```ts
const VOICE = 'en-US-AnaNeural';  // any edge-tts voice — 300+ options
const PITCH = '+10Hz';
const RATE  = '+12%';
```

```bash
edge-tts --list-voices  # see all 300+ voices across 70+ languages
```

### Change her personality

Edit the system prompt in `src/hooks/useAI.ts`. One paragraph of text and she becomes a completely different character — therapist, tutor, roleplay partner, language practice buddy, whatever you want.

---

## 📁 Codebase is tiny and clean

```
src/
├── components/
│   ├── ChatUI.tsx       ← chat panel, mic button, interrupt handling
│   ├── Experience.tsx   ← Three.js scene — lighting, camera, floor
│   └── Model.tsx        ← VRM loader + every animation system
├── hooks/
│   ├── useAI.ts         ← LLM client (OpenRouter)
│   └── useSpeech.ts     ← TTS client + Web Audio analyser
tts_server.py            ← 50-line FastAPI wrapper for edge-tts
```

~500 lines of TypeScript. You can read the whole thing in 20 minutes and understand every moving part.

---

## ⚠️ Known limitations (being worked on)

- TTS server must be running locally — no cloud fallback yet
- VRM 1.0 support is untested — use VRM 0.x models
- Lip-sync is frequency-based, not phoneme-based (sounds great, not perfect)
- No persistent memory between sessions yet

---

## 🤝 Want to make it better?

The most wanted contributions right now:

- **Phoneme-based lip-sync** — map viseme morphs to actual phonemes from TTS
- **VRM 1.0 support**
- **Persistent memory** — give her a JSON memory of past conversations
- **Emotion system** — drive face morph targets based on LLM sentiment

Open a PR. Every contribution gets acknowledged in the readme.

---

## 📄 License

**MIT** — free for personal projects, side projects, commercial projects, whatever. Go wild.

---

<div align="center">

### Built by [Lumacodes](https://github.com/Lumacodes)

**⭐ Star this if it blew your mind — it's the best way to help others find it**

<br/>

*If this saved you weeks of research or gave you an idea for something cool — a coffee means a lot 🙏*

[![Support on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/lumacodes)

</div>
