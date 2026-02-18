# Meme Responder 🤣

An AI-powered web app that analyzes messaging screenshots and generates the perfect meme response.

## What It Does

1. **Upload** a screenshot from any messaging app (iMessage, WhatsApp, Instagram DMs, Discord, Telegram, etc.)
2. **OCR** extracts the conversation text from the image
3. **AI Analysis** detects:
   - **Sentiment** — positive, negative, neutral
   - **Emotions** — joy, anger, sadness, sarcasm, surprise, affection, fear, disgust
   - **Tone** — casual, formal, urgent, playful, passive-aggressive, flirty, dry
   - **Inflection** — yelling, questioning, hesitant, emphatic
   - **Themes** — making plans, relationship, gossip, argument, humor, etc.
   - **Texting style** — short/paragraph texter, emoji usage, slang, caps, energy level
4. **Meme generation** — picks a fitting meme template, generates captions, and finds GIFs + trending memes

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion   |
| Backend    | Node.js, Express                              |
| OCR        | Tesseract.js, Sharp (image preprocessing)     |
| NLP        | Sentiment (sentiment analysis), Compromise.js  |
| Meme APIs  | Imgflip (meme generation), Giphy (GIFs), Meme API (Reddit) |

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Install dependencies

```bash
# From the project root
cd server && npm install
cd ../client && npm install
```

### 2. Configure API keys (optional but recommended)

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your keys:

| Key                | Where to get it                         | Required? |
|--------------------|-----------------------------------------|-----------|
| `IMGFLIP_USERNAME` | https://imgflip.com/signup              | Optional — enables auto-generated meme images |
| `IMGFLIP_PASSWORD` | (same as above)                         | Optional  |
| `GIPHY_API_KEY`    | https://developers.giphy.com/           | Optional — enables GIF reactions |

> The app works without any API keys! It will show meme templates + captions and trending Reddit memes.

### 3. Run the app

In two terminals:

```bash
# Terminal 1 — Backend (port 3001)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint                  | Description                              |
|--------|---------------------------|------------------------------------------|
| POST   | `/api/analyze/screenshot` | Upload image → OCR + full analysis       |
| POST   | `/api/analyze/text`       | Analyze raw conversation text            |
| POST   | `/api/meme/generate`      | Generate a meme from analysis context    |
| POST   | `/api/meme/gifs`          | Search for reaction GIFs                 |
| POST   | `/api/meme/web`           | Fetch trending memes from Reddit         |
| GET    | `/api/health`             | Health check                             |

## Project Structure

```
Meme-Responder/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # App header
│   │   │   ├── UploadSection.jsx   # Drag & drop upload
│   │   │   ├── TextInput.jsx       # Paste text mode
│   │   │   ├── AnalysisResults.jsx # Analysis dashboard
│   │   │   └── MemeResults.jsx     # Meme display (tabs)
│   │   ├── api.js              # API client
│   │   ├── App.jsx             # Main app
│   │   └── main.jsx            # Entry point
│   └── ...config files
├── server/                     # Express backend
│   └── src/
│       ├── index.js            # Server entry
│       ├── routes/
│       │   ├── analyze.js      # Screenshot/text analysis
│       │   └── meme.js         # Meme generation/search
│       └── services/
│           ├── ocr.js          # Tesseract OCR + preprocessing
│           ├── analyzer.js     # NLP analysis engine
│           └── memeEngine.js   # Meme template matching + APIs
└── README.md
```

## How the Analysis Works

### Sentiment Analysis
Uses the `sentiment` npm package to score text on a positive-negative scale with word-level breakdown.

### Emotion Detection
Custom lexicon-based detection covering 8 emotions with 20+ trigger words each, including emoji support.

### Tone Classification
Pattern matching for conversational tone: casual/formal, urgent, playful, passive-aggressive, flirty, dry/deadpan.

### Meme Matching
Each detected emotion maps to curated meme templates (50+ templates total). Captions are generated based on conversation context and mood.

## License

MIT
