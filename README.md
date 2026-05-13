# ADF-X: Advanced Aircraft Detection System

ADF-X is a full-stack platform that uses YOLO for object detection, EfficientNet for classification, and Gemini AI for technical telemetry retrieval.

## Setup Instructions

Follow these steps to run the project on a new machine:

### 1. Clone the Repository
```bash
git clone https://github.com/bshinib483/Img-detection.git
cd Img-detection
```

### 2. Backend Setup (Python)
Ensure you have Python 3.9+ installed.
```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python api.py
```
The backend will be running at `http://localhost:8000`.

### 3. Frontend Setup (Next.js)
Ensure you have Node.js 18+ installed.
```bash
cd aerovision-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Open .env.local and add your GEMINI_API_KEY

# Start the development server
npm run dev
```
The frontend will be running at `http://localhost:3000`.

## Features
- **Scrollytelling Hero:** Premium cinematic 3D hardware animation.
- **Dual-Model Inference:** YOLOv8 (Detection) + EfficientNet (Classification).
- **AI Intelligence:** Dynamic technical data retrieval via Gemini Pro.
- **Tactical UI:** Dark-mode interface designed for high-end situational awareness.
