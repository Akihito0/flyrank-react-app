<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture Rules

## Project Overview
Standalone practice application for FlyRank's "React app development with AI"
assignment (Week 3) — built independently using AI as a development assistant,
documenting prompts and manual corrections along the way. Not part of the
capstone; kept in its own repository per program guidance.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Firebase (Authentication + Firestore)
- Testing: Jest + ts-jest

## Architecture Rules — Non-Negotiable
Strict MVVM (Model-View-ViewModel) + Separation of Concerns. Same layering
rules as the capstone project:

1. **Models** (`src/models/`): Pure TypeScript types/interfaces + domain logic
   only. No Firebase imports, no React imports, no side effects.
2. **Services** (`src/services/`): All Firebase/API calls live here ONLY.
   No React hooks, no component state.
3. **ViewModels** (`src/view-models/`): Custom hooks ONLY. Own loading/error/
   data state, call the Service layer, expose a clean interface to Views.
4. **Views**: Only JSX + conditional rendering + calling ViewModel hooks.
   Never call Firebase directly, never contain business logic.

## Working Style
1. Before writing a feature, briefly state which layer(s) it touches and why.
2. Show the full chain when new: Model → Service → ViewModel → View.
3. Flag explicitly if a request would break this layering.
4. Use TypeScript strictly — no `any`.