# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **interactive presentation application** built with React, TypeScript, and Vite. It creates dynamic slideshow presentations with:

- **6 distinct slide layouts**: cover, chart, keypoints, flow, multiline-type, and floating-lines
- **Azure Speech Service integration** for text-to-speech narration with word-level highlighting
- **ECharts visualizations** (top notes, topic distribution, cumulative trend charts)
- **GSAP animations** for smooth transitions and effects
- **Screen recording capability** to export presentations as video
- **Multiple presentation scripts** loaded from JSON files

## Architecture

### Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── background/       # Background effects (highspeed, squares)
│   ├── slide/           # Chart components and slide features
│   ├── ui/              # Base UI components (Button, etc.)
│   ├── *.tsx            # Animation & text components
│   └── Player.tsx       # Main presentation controller
├── content/             # TypeScript type definitions
│   └── xlinDataInsghtScript.ts  # Script data structures
├── hooks/               # Custom React hooks
│   ├── useScriptData.ts       # Fetch script data
│   ├── useScriptsList.ts      # List available scripts
│   ├── useAzureSpeech.ts      # Azure TTS integration
│   ├── useSpeech.ts           # Speech controls
│   └── useRecording.ts        # Screen recording
├── presentation/        # Slide rendering logic
│   └── Presentation.tsx       # Generic layout renderer
├── services/            # External service integrations
│   └── llmService.ts          # LLM API calls
├── types/               # TypeScript interfaces
│   └── script.ts              # Script type definitions
├── App.tsx              # Application root
└── main.tsx             # Entry point
```

### Core Components

- **Player.tsx**: Main controller managing navigation, speech, recording, and script selection
- **Presentation.tsx**: Renders different slide layouts based on section configuration
- **Script files** (JSON in `/public/scripts/`): Define presentation structure, content, and timing

### Data Flow

1. **App.tsx** loads script index and selected script data via hooks
2. **useScriptData** fetches JSON from `/public/scripts/{scriptName}.json`
3. **App.tsx** transforms script sections into React nodes
4. **Player** renders pages with navigation and audio controls

### Slide Layouts

All layouts are defined in `src/presentation/Presentation.tsx`:

- **cover**: Title page with emoji and feature list
- **keypoints**: Bulleted points with animated reveals
- **flow**: Step-by-step process with emoji left, content right
- **chart**: Data visualizations (TopNotesChart, TopicDistributionChart, CumulativeTrendChart)
- **multiline-type**: Cycling text lines with type/delete animation
- **floating-lines**: Continuously floating text lines

### Type Definitions

Key interfaces in `src/content/xlinDataInsghtScript.ts`:

```typescript
ScriptSection {
  id: string;
  title?: string;
  content?: featureContent[];
  illustration?: string;
  layout: 'cover' | 'chart' | 'keypoints' | 'flow' | 'multiline-type' | 'floating-lines';
  chartType?: 'topNotes' | 'topicDistribution' | 'cumulativeTrend';
  chartData?: TopNotesData[] | TopicDistributionData[] | CumulativeTrendData[];
  chartDataUrl?: string;
}

featureContent {
  type: 'feature';
  data: { title?, description?, icon? };
  read_srt: string;      // Speech synthesis text
  duration: number;      // Timing in seconds
}
```

## Common Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Azure Speech Service (required for TTS)
VITE_AZURE_SPEECH_KEY=your_subscription_key
VITE_AZURE_SPEECH_REGION=eastus

# LLM API (optional)
VITE_LLM_API_KEY=your_api_key
VITE_LLM_API_URL=https://ai.reluv.xyz/v1
```

## Script Data Structure

Presentation scripts are JSON files stored in `/public/scripts/`:

- **xiaLinScript.json** (20KB)
- **memeCoinScript.json** (11KB)
- **ysjfTagInsightScript.json** (8KB)
- **index.json** - Lists available scripts

Each script contains:
- `title`: Presentation title
- `sections[]`: Array of ScriptSection objects
  - Each section has a `layout` determining how it renders
  - `content[]` array with `featureContent` items
  - Optional `chartDataUrl` for dynamic chart loading

Chart data stored in `/public/data/`:
- `topNotesData.json`
- `topicDistributionData.json`
- `cumulativeTrendData.json`

## Key Technologies

- **Vite 7.1.10**: Build tool and dev server
- **React 19.2.0**: UI library
- **TypeScript 5.9.3**: Type safety
- **TailwindCSS 4.1.16**: Styling (with Vite plugin)
- **GSAP 3.13.0 + @gsap/react 2.1.2**: Animations
- **ECharts 5.6.0**: Data visualization
- **Azure Speech SDK 1.46.0**: Text-to-speech
- **Three.js 0.180.0**: 3D graphics
- **Lucide React**: Icons

## Custom Hooks

- **useScriptData**: Async fetch script JSON data
- **useScriptsList**: Load available script files list
- **useAzureSpeech**: Azure TTS with word boundary events
- **useSpeech**: Generic speech control wrapper
- **useRecording**: MediaRecorder screen capture (30 FPS)

## Notable Features

### Speech Integration
- Word-level highlighting during playback
- Configurable voice selection
- Subtitle text extracted from `read_srt` fields
- Callback-based progress tracking

### Animation System
- GSAP-powered transitions
- Layout-specific animation patterns:
  - Sequential item reveals (keypoints, flow)
  - Typewriter effects (TextType, MultiLineTextType)
  - Continuous floating (FloatingLinesText)
  - Fade-in animations (FadeContent)

### Chart Components
Located in `src/components/slide/`:
- **TopNotesChart**: Bar chart for top notes
- **TopicDistributionChart**: Pie/donut chart
- **CumulativeTrendChart**: Line chart with trends

All charts use ECharts with React integration.

## Development Tips

- Add new slide layouts by extending the `layout` type and adding a case in `Presentation.tsx`
- Create chart components by extending the chart type system
- Script timing controlled by `duration` fields (in seconds)
- Animation timings are in milliseconds
- Background effects: `highspeed` (Hyperspeed), `squares` (grid pattern)

## ESLint Configuration

Located in `eslint.config.js`:
- Extends recommended configs for ESLint, TypeScript, React hooks
- React Refresh enabled for fast HMR
- Type-aware linting available but not enabled (see README.md for instructions)

## Build Configuration

- **vite.config.ts**: Vite + React + Tailwind plugins
- Path alias: `@` → `./src`
- TypeScript configs: separate configs for app and node

## Dependencies

**Production**:
- Animation: `@gsap/react`, `gsap`
- UI: `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `lucide-react`
- Charts: `echarts`, `echarts-for-react`
- 3D: `three`, `@types/three`
- Speech: `microsoft-cognitiveservices-speech-sdk`
- Styling: `tailwind-merge`, `@tailwindcss/vite`, `tailwindcss`
- Utilities: `html-to-image`, `postprocessing`

**Development**:
- Vite ecosystem, TypeScript, ESLint, TailwindCSS

## Testing

No test framework currently configured. To add tests:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Deployment

Build output in `dist/` folder:
```bash
npm run build
# Deploy dist/ to static hosting (Netlify, Vercel, etc.)
```