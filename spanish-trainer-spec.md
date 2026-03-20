# Spanish Listening Trainer — Claude Code Spec

## Overview

A mobile-first web app that trains Spanish listening comprehension by simulating what locals in Spain will say to you in real situations. The user hears a Spanish audio prompt (e.g., a server asking "¿Qué van a tomar?"), tries to understand it, then reveals the answer. The app tracks progress with spaced repetition so missed phrases come back more frequently.

A working browser-based prototype already exists (see `spanish-listening-trainer.jsx`). This spec describes the upgraded version with natural-sounding TTS and persistent progress tracking.

## Core User Flow

1. **Home screen**: Pick scenario categories (Restaurant, Grocery, Pharmacy, etc.) or start with all
2. **Practice loop**:
   - See the situational context (e.g., "Server taking your order at a restaurant")
   - Hear the Spanish audio prompt auto-play with natural Peninsular Spanish TTS
   - Optionally replay, adjust speed
   - Tap "Reveal Answer" to see: the Spanish text, English translation, and a suggested response
   - Self-mark: "Understood" or "Didn't Get It"
3. **Session summary**: Score, list of missed prompts with replay buttons, option to retry missed only
4. **Progress over time**: Spaced repetition surfaces weak phrases more often across sessions

## Tech Stack

- **Frontend**: React (Vite) with Tailwind CSS
- **TTS**: ElevenLabs API (primary) or Google Cloud TTS (fallback)
  - Voice: Use a Peninsular Spanish (es-ES) voice, male or female — pick one that sounds natural and conversational, not robotic or overly formal
  - Pre-generate audio files for all prompts and cache them as .mp3 files rather than calling the API on every play. This keeps the app fast and avoids burning API credits during practice
  - Include a script (`scripts/generate-audio.ts`) that reads all prompts from the data file and generates/caches the audio files in `public/audio/`
- **Data**: JSON file (`data/prompts.json`) — easy to edit and extend
- **Progress storage**: localStorage for MVP (no backend needed)
- **Deployment**: Static site — Vercel, Netlify, or just open the build locally

## Data Structure

```json
{
  "scenarios": [
    {
      "id": "restaurant",
      "category": "Restaurant",
      "icon": "🍽️",
      "color": "#E85D3A",
      "prompts": [
        {
          "id": "rest-001",
          "spanish": "¡Hola! ¿Para cuántos?",
          "english": "Hi! For how many?",
          "context": "Hostess greeting you at the door",
          "yourResponse": "Para cuatro, por favor.",
          "tags": ["greeting", "arrival"],
          "difficulty": 1
        }
      ]
    }
  ]
}
```

### Initial Prompt Data

Port all prompts from the prototype. The prototype has 8 scenario categories with ~60 total prompts:

- Restaurant (10 prompts)
- Grocery Store (8)
- Getting Around (7)
- Airbnb / Check-in (7)
- Shopping (6)
- Activities & Tickets (6)
- Pharmacy (6)
- Café & Bar (6)

All phrases use tú-form Spanish (informal), appropriate for Barcelona. See the prototype JSX file for the complete prompt list.

## Audio Generation Script

`scripts/generate-audio.ts`:

- Reads `data/prompts.json`
- For each prompt, checks if `public/audio/{prompt.id}.mp3` already exists
- If not, calls ElevenLabs API to generate audio with:
  - Peninsular Spanish voice
  - Slightly slowed rate (~0.85x-0.9x normal) for the "normal" speed tier
  - Natural conversational tone
- Saves the mp3 to `public/audio/`
- Generate 3 speed variants per prompt: `{id}-slow.mp3` (0.7x), `{id}-normal.mp3` (0.85x), `{id}-fast.mp3` (1.0x native speed)
- Requires `ELEVENLABS_API_KEY` environment variable
- Run with: `npx tsx scripts/generate-audio.ts`

This means the app itself never calls the TTS API at runtime — it just plays pre-cached mp3 files.

## Features

### Speed Control

- Three speed settings: Slow (0.7x), Normal (0.85x), Fast (1.0x native speed)
- Speed selection is persistent across the session
- Use the pre-generated speed variants (see audio generation script above)
- Default to "Normal" for new users, remember last setting

### Spaced Repetition (Simple)

Track per-prompt stats in localStorage:

```json
{
  "rest-001": {
    "timesShown": 5,
    "timesUnderstood": 3,
    "lastShown": "2026-05-15T10:30:00Z",
    "streak": 1
  }
}
```

When building a practice queue:
- Prompts marked "Didn't Get It" recently get 3x weight
- Prompts never seen before get 2x weight
- Prompts with a streak of 3+ correct get 0.5x weight
- Within the weighted pool, shuffle randomly
- This doesn't need to be fancy — just enough to surface weak spots more often

### Session Modes

1. **Full practice**: All prompts from selected categories, weighted by spaced repetition
2. **Quick review**: Only prompts you've previously missed (streak < 2), limited to 15 prompts
3. **New phrases**: Only prompts you haven't seen before

### Progress Dashboard (Simple)

Accessible from the home screen:
- Overall comprehension rate (understood / total attempts)
- Per-category breakdown with simple bar chart
- "Weakest phrases" list — the 10 prompts with lowest comprehension rate (min 3 attempts)
- Streak counter: consecutive days practiced
- Reset button to clear all progress

## UI/UX Design

### Design Direction

Mobile-first, dark theme. The prototype has good bones — keep the same general aesthetic:

- Background: near-black (#0D0D0F)
- Cards: subtle glass-morphism with very faint borders
- Accent: warm orange-red (#E85D3A) for primary actions
- Category colors for scenario pills
- Typography: DM Sans for body, JetBrains Mono for stats/labels
- Animations: subtle fade-up on card transitions, pulse on audio playing

### Key Screens

**Home**: Category selector grid, session mode toggle (Full / Quick Review / New), start button with prompt count, streak indicator

**Practice**: Context pill at top → large listen area with ear icon → play button → reveal button → understood/didn't buttons. Clean and focused — nothing distracting.

**Reveal**: Same card expands to show Spanish text, English translation, suggested response in a green-tinted box. Play button stays visible for replay.

**Summary**: Score with emoji reaction, missed prompt list with individual replay buttons, retry/new session actions.

**Progress**: Simple stats dashboard — nothing fancy, just useful. Comprehension rates, weak phrases, streak.

### Mobile Considerations

- Touch targets minimum 48px
- No horizontal scrolling
- Bottom-anchored action buttons within thumb reach
- Works well on both phone and tablet
- Audio should work on mobile browsers (note: iOS requires user interaction before first audio play — handle this with a "tap to begin" on session start)

## File Structure

```
spanish-trainer/
├── public/
│   └── audio/           # Pre-generated mp3 files
│       ├── rest-001-slow.mp3
│       ├── rest-001-normal.mp3
│       ├── rest-001-fast.mp3
│       └── ...
├── src/
│   ├── components/
│   │   ├── Home.tsx
│   │   ├── Practice.tsx
│   │   ├── Summary.tsx
│   │   ├── Progress.tsx
│   │   ├── SpeakButton.tsx
│   │   └── SpeedControl.tsx
│   ├── data/
│   │   └── prompts.json
│   ├── hooks/
│   │   ├── useAudio.ts
│   │   ├── useProgress.ts      # localStorage read/write
│   │   └── useSpacedQueue.ts   # weighted queue builder
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   └── generate-audio.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Adding New Phrases

The workflow for adding phrases should be simple:

1. Edit `data/prompts.json` — add new prompt objects to the appropriate scenario
2. Run `npx tsx scripts/generate-audio.ts` — it only generates audio for new/missing prompts
3. Build and deploy

This makes it easy to add phrases on the fly as you encounter new situations during the trip.

## Out of Scope (Future Ideas)

These are NOT part of the initial build but could be added later:

- **Voice input**: Speak your response, evaluate with Whisper + Claude API
- **Conversation mode**: Multi-turn exchanges that simulate a full interaction (e.g., complete restaurant experience from greeting to check)
- **Difficulty progression**: Auto-advance speed as comprehension improves
- **PWA / offline mode**: Cache audio and app shell for offline practice
- **Phrase contributor**: A simple form to add new phrases from within the app
- **Multiple language support**: Same framework for Portuguese, Catalan, etc.

## Getting Started

```bash
# Clone and install
cd spanish-trainer
npm install

# Set up ElevenLabs API key
export ELEVENLABS_API_KEY=your_key_here

# Generate audio files
npx tsx scripts/generate-audio.ts

# Dev server
npm run dev

# Build for deployment
npm run build
```
