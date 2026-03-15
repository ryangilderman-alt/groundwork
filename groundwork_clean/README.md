# Groundwork — Sales Intelligence Platform

Research accounts. Profile stakeholders. Generate personalized sequences. Track every touch.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Add environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com
4. Click Deploy

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (sk-ant-...) |

## Stack

- Next.js 14 (App Router)
- React 18
- Anthropic Claude API (claude-sonnet-4-20250514)
- Web Search tool for auto-research
- localStorage for persistence
