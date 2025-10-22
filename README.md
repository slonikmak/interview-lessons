# Interview Lessons - POC UI

An interactive lesson platform for coding interviews, built with Next.js 15 and React 18.

## Features

- **View Lesson Content**: Auto-loads lesson from JSON and renders text, code tasks, and quizzes
- **Code Execution**: Edit starter code and run tests with instant feedback and 3s per-test timeout
- **AI Assistant**: Ask questions about any section using Google's Gemini 1.5 Flash
- **Modern UI**: Built with TailwindCSS, dark mode support, and responsive design

## Prerequisites

- Node.js 20.x LTS
- npm, yarn, or pnpm
- Google API Key with Gemini API access

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd interview-lessons
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

Or set the environment variable directly (Windows PowerShell):

```powershell
$env:GOOGLE_API_KEY="your_google_api_key_here"
```

## Development

Start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically load the lesson from `/public/two_sum_full.json`.

## Testing

Run the test suite:

```bash
npm test
# or
pnpm test
# or
yarn test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/           # AI chat endpoint
│   │   └── run/          # Code execution endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (lesson viewer)
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── CodeEditor.tsx
│   ├── ErrorBanner.tsx
│   ├── LessonSection.tsx
│   ├── SectionChat.tsx
│   ├── TestResults.tsx
│   ├── TextSection.tsx
│   └── UnsupportedSection.tsx
├── lib/                   # Utilities and schemas
│   ├── env.server.ts     # Server environment validation
│   ├── errors.ts         # Error types and helpers
│   ├── sandbox/          # Code execution sandbox
│   └── schemas/          # Zod validation schemas
├── public/                # Static assets
│   └── two_sum_full.json # Sample lesson
└── tests/                 # Test suites
    ├── contract/         # API contract tests
    ├── integration/      # Integration tests
    ├── unit/             # Unit tests
    └── setup/            # Test setup and utilities
```

## Architecture

- **Frontend**: Next.js 15 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes (server-only)
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **Validation**: Zod schemas
- **Testing**: Jest + React Testing Library

## Key Features

### Lesson Rendering

The app loads lesson JSON and renders different section types:
- **Text sections**: Display content with AI chat support
- **Code tasks**: Interactive code editor with test execution
- **Quiz sections**: (Coming soon)

### Code Execution

User code is executed server-side in a sandboxed environment:
- 3-second timeout per test
- Structured test results with pass/fail status
- Error messages and execution time tracking

### AI Assistant

Each section includes an AI chat interface:
- Context-aware responses based on section content
- Chat history maintained per session
- Helpful guidance without giving away solutions

## Security

- API keys are server-only (never exposed to client)
- Code execution is sandboxed (no file system or network access)
- Input validation using Zod schemas
- Content Security Policy headers

## Performance

- Code splitting with dynamic imports
- Optimized bundle size (target: <200KB gzipped)
- LCP target: ≤2.5s
- API p95 latency: ≤300ms (excluding AI calls)

## Known Limitations

- Single lesson POC (no lesson selection/navigation)
- No user authentication or persistence
- Basic code sandbox (consider vm2/isolated-vm for production)
- Quiz sections not yet implemented

## Future Enhancements

See `specs/001-lesson-poc-ui/spec.md` for P2/P3 user stories:
- Quiz support (P2)
- Session state retention (P3)
- Lesson persistence
- Progress tracking

## Contributing

This is a POC project. See `/specs/001-lesson-poc-ui/` for specification and planning documents.

## License

[Your License Here]
