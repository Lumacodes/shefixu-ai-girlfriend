#!/bin/bash
echo "Starting Kokoro-TTS-Local on port 7860..."
cd /Users/subha/aigf/Kokoro-TTS-Local
source venv_311/bin/activate
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 python gradio_interface.py --port 7860
