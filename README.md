# Roomtify

Roomtify is an AI-powered architectural design review app built with React Router and Puter. It lets users upload floor plan images, generate 3D style renders using the Putter AI SDK, compare before/after views, save projects, and export images.

## What this project uses

- **React 19** for the UI
- **React Router v8** for routing and nested route layout
- **TypeScript** for type-safe components
- **Vite** as the dev/build tool
- **Tailwind CSS** for styling and responsive layout
- **@heyputer/puter.js** for:
  - authentication
  - KV storage for project persistence
  - hosting asset uploads
  - image generation via `puter.ai.txt2img`
- **react-compare-slider** for the before/after comparison view
- **lucide-react** for iconography

## Key app structure

- `app/root.tsx`
  - app layout and metadata
  - auth state initialization using Puter
  - provides `signIn`, `signOut`, and user context to child routes

- `app/routes/home.tsx`
  - upload page and project gallery
  - `Upload` component triggers `handleUploadComplete`
  - saves a new project through `createProject`
  - navigates to `/visualizer/:id` after save

- `app/routes/visualizer.$id.tsx`
  - loads a project by ID with `getProjectById`
  - generates the AI render if not already available
  - stores generated results and updates the saved project
  - displays a rendered preview and a before/after slider
  - exports the current rendered image in the browser

- `lib/ai.action.ts`
  - converts image URLs to base64 data URLs
  - calls `puter.ai.txt2img` with the `ROOMIFY_RENDER_PROMPT`
  - returns a rendered image as a data URL

- `lib/putter.action.ts`
  - handles Puter worker endpoint calls for project creation and fetching
  - normalizes `VITE_PUTER_WORKER_URL`
  - sends requests to `/api/projects/save`, `/api/projects/list`, and `/api/projects/get`

- `lib/puter.worker.js`
  - defines worker-side endpoints for project persistence
  - authenticates the Puter user
  - lists, retrieves, and saves projects in KV storage

- `lib/puter.hosting.ts`
  - manages hosting configuration and file uploads for source/render assets

- `lib/constans.tsx`
  - environment-normalized worker URL handling
  - project storage path constants
  - the Roomtify AI prompt used for image generation

## Installation

```bash
npm install
```

## Configuration

Create or update `.env.local` with:

```env
VITE_PUTER_WORKER_URL=https://your-worker.puter.work
```

> The app assumes a Puter environment with authentication, KV storage, and API access. Make sure your Puter account has enough credits for image generation.

## Creating a Puter account

1. Go to `https://puter.com` and sign up for an account.
2. Verify your email and sign in.
3. Create a worker or deployment that exposes your Puter app endpoint.
4. Obtain the worker URL and add it to `.env.local` as `VITE_PUTER_WORKER_URL`.
5. Ensure your Puter account has active credits or a billing plan for image generation.

## Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build and run

```bash
npm run build
npm run start
```

## How to use

1. Open the home screen.
2. Upload a floor plan image.
3. The app creates a project and navigates to the visualizer.
4. If no rendered image exists, Roomtify uses the Putter AI backend to generate one.
5. Compare the original and generated render using the slider.
6. Export the rendered image with the Export button.

## Notes

- `createProject` persists project data to Puter KV.
- The visualizer page will regenerate only when a project has no existing `renderedImage`.
- Error handling includes generation failures and save failures, with user-facing render error messages.
- The export handler downloads the current rendered image as a `.png` file.

## Dependencies

- `@heyputer/puter.js`
- `@react-router/node`, `@react-router/serve`, `react-router`
- `react`, `react-dom`
- `react-compare-slider`
- `lucide-react`
- `tailwindcss`, `@tailwindcss/vite`
- `typescript`, `vite`

## Directory notes

- `app/` contains route-level pages and root layout.
- `components/` contains reusable UI components like `Button`, `Navbar`, and `Upload`.
- `lib/` contains business logic for AI generation, Puter integration, and hosting.
- `public/` holds static assets.

---

Built as a React Router + Puter powered visual design workflow app.
