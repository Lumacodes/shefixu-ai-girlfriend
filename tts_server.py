import edge_tts
import asyncio
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/tts")
async def get_tts(text: str, voice: str = "en-US-AnaNeural", rate: str = "+0%", pitch: str = "+0Hz"):
    """Generate expressive speech using edge-tts."""
    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]

        if not audio_data:
            return Response(content="No audio generated", status_code=500)

        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        print(f"Error generating TTS: {e}")
        return Response(content=str(e), status_code=500)

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
