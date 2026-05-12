import type { PuterAIModel } from "@/types";

export const PUTER_MODELS: PuterAIModel[] = [
  { id: 'gpt-4o',                                        label: 'GPT-4o',              provider: 'OpenAI',    color: 'text-green-400' },
  { id: 'gpt-4o-mini',                                   label: 'GPT-4o Mini',         provider: 'OpenAI',    color: 'text-green-300' },
  { id: 'o1-mini',                                       label: 'o1 Mini',             provider: 'OpenAI',    color: 'text-emerald-400' },
  { id: 'o3-mini',                                       label: 'o3 Mini',             provider: 'OpenAI',    color: 'text-emerald-300' },
  { id: 'claude-sonnet-4-5',                             label: 'Claude Sonnet 4.5',   provider: 'Anthropic', color: 'text-orange-400' },
  { id: 'claude-opus-4-5',                               label: 'Claude Opus 4.5',     provider: 'Anthropic', color: 'text-amber-400' },
  { id: 'claude-haiku-3-5',                              label: 'Claude Haiku 3.5',    provider: 'Anthropic', color: 'text-orange-300' },
  { id: 'gemini-2.0-flash',                              label: 'Gemini 2.0 Flash',    provider: 'Google',    color: 'text-blue-400' },
  { id: 'gemini-1.5-pro',                                label: 'Gemini 1.5 Pro',      provider: 'Google',    color: 'text-blue-300' },
  { id: 'mistral-large-latest',                          label: 'Mistral Large',       provider: 'Mistral',   color: 'text-purple-400' },
  { id: 'deepseek-chat',                                 label: 'DeepSeek Chat',       provider: 'DeepSeek',  color: 'text-cyan-400' },
  { id: 'deepseek-r1',                                   label: 'DeepSeek R1',         provider: 'DeepSeek',  color: 'text-cyan-300' },
  { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',  label: 'Llama 3.1 8B',        provider: 'Meta',      color: 'text-pink-400' },
  { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', label: 'Llama 3.1 70B',       provider: 'Meta',      color: 'text-pink-300' },
];

export interface ModelInfo {
  id: string;
  puterModel: string;
  label: string;
  provider: 'openai' | 'anthropic' | 'google' | 'mistral' | 'deepseek' | 'meta' | 'perplexity';
  context: string;
  inputPrice: string;
  outputPrice: string;
  capabilities: string[];
}

export const ALL_MODELS: ModelInfo[] = [
  { id: 'openai/gpt-4o',          puterModel: 'gpt-4o',             label: 'GPT-4o',              provider: 'openai',     context: '128K', inputPrice: '$5.00/M',   outputPrice: '$15.00/M',  capabilities: ['text', 'image', 'code'] },
  { id: 'openai/gpt-4o-mini',     puterModel: 'gpt-4o-mini',        label: 'GPT-4o Mini',         provider: 'openai',     context: '128K', inputPrice: '$0.15/M',   outputPrice: '$0.60/M',   capabilities: ['text', 'code'] },
  { id: 'openai/o1-mini',         puterModel: 'o1-mini',            label: 'o1 Mini',             provider: 'openai',     context: '128K', inputPrice: '$1.10/M',   outputPrice: '$4.40/M',   capabilities: ['text', 'reasoning'] },
  { id: 'openai/o3-mini',         puterModel: 'o3-mini',            label: 'o3 Mini',             provider: 'openai',     context: '200K', inputPrice: '$1.10/M',   outputPrice: '$4.40/M',   capabilities: ['text', 'reasoning'] },
  { id: 'openai/gpt-4.5',         puterModel: 'gpt-4o',             label: 'GPT-4.5',             provider: 'openai',     context: '128K', inputPrice: '$75.00/M',  outputPrice: '$150.00/M', capabilities: ['text', 'image', 'code'] },
  { id: 'openai/gpt-4.5-mini',    puterModel: 'gpt-4o-mini',        label: 'GPT-4.5 Mini',        provider: 'openai',     context: '128K', inputPrice: '$5.00/M',   outputPrice: '$30.00/M',  capabilities: ['text', 'code'] },
  { id: 'anthropic/claude-opus-4.7',    puterModel: 'claude-opus-4-5',    label: 'Claude Opus 4.7',     provider: 'anthropic',  context: '1M',   inputPrice: '$5.00/M',   outputPrice: '$25.00/M',  capabilities: ['text', 'code', 'reasoning'] },
  { id: 'anthropic/claude-opus-4-5',   puterModel: 'claude-opus-4-5',    label: 'Claude Opus 4.5',     provider: 'anthropic',  context: '200K', inputPrice: '$15.00/M',  outputPrice: '$75.00/M',  capabilities: ['text', 'code', 'reasoning'] },
  { id: 'anthropic/claude-sonnet-4-5', puterModel: 'claude-sonnet-4-5',  label: 'Claude Sonnet 4.5',   provider: 'anthropic',  context: '200K', inputPrice: '$3.00/M',   outputPrice: '$15.00/M',  capabilities: ['text', 'code'] },
  { id: 'anthropic/claude-haiku-3-5',  puterModel: 'claude-haiku-3-5',   label: 'Claude Haiku 3.5',    provider: 'anthropic',  context: '200K', inputPrice: '$0.80/M',   outputPrice: '$4.00/M',   capabilities: ['text', 'code'] },
  { id: 'google/gemini-2.0-flash',     puterModel: 'gemini-2.0-flash',   label: 'Gemini 2.0 Flash',    provider: 'google',     context: '1M',   inputPrice: '$0.10/M',   outputPrice: '$0.40/M',   capabilities: ['text', 'image', 'code'] },
  { id: 'google/gemini-1.5-pro',       puterModel: 'gemini-1.5-pro',     label: 'Gemini 1.5 Pro',      provider: 'google',     context: '2M',   inputPrice: '$1.25/M',   outputPrice: '$5.00/M',   capabilities: ['text', 'image', 'code'] },
  { id: 'google/gemini-3.1-flash-lite',puterModel: 'gemini-2.0-flash',   label: 'Gemini 3.1 Flash Lite',provider: 'google',    context: '1M',   inputPrice: '$0.03/M',   outputPrice: '$0.15/M',   capabilities: ['text', 'code'] },
  { id: 'mistral/mistral-large-latest',puterModel: 'mistral-large-latest',label: 'Mistral Large',       provider: 'mistral',    context: '128K', inputPrice: '$2.00/M',   outputPrice: '$6.00/M',   capabilities: ['text', 'code'] },
  { id: 'deepseek/deepseek-chat',      puterModel: 'deepseek-chat',      label: 'DeepSeek Chat',       provider: 'deepseek',   context: '64K',  inputPrice: '$0.27/M',   outputPrice: '$1.10/M',   capabilities: ['text', 'code'] },
  { id: 'deepseek/deepseek-r1',        puterModel: 'deepseek-r1',        label: 'DeepSeek R1',         provider: 'deepseek',   context: '64K',  inputPrice: '$0.55/M',   outputPrice: '$2.19/M',   capabilities: ['text', 'reasoning'] },
  { id: 'meta/llama-3.1-8b',           puterModel: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',  label: 'Llama 3.1 8B',  provider: 'meta', context: '128K', inputPrice: '$0.18/M', outputPrice: '$0.18/M', capabilities: ['text', 'code'] },
  { id: 'meta/llama-3.1-70b',          puterModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', label: 'Llama 3.1 70B', provider: 'meta', context: '128K', inputPrice: '$0.88/M', outputPrice: '$0.88/M', capabilities: ['text', 'code'] },
  { id: 'perplexity/sonar-huge',        puterModel: 'mistral-large-latest', label: 'Sonar Huge',       provider: 'perplexity', context: '127K', inputPrice: '$5.00/M', outputPrice: '$5.00/M', capabilities: ['text', 'search'] },
  { id: 'perplexity/sonar-pro',         puterModel: 'mistral-large-latest', label: 'Sonar Pro',        provider: 'perplexity', context: '200K', inputPrice: '$3.00/M', outputPrice: '$15.00/M', capabilities: ['text', 'search'] },
];

export function getModelById(id: string): PuterAIModel {
  return PUTER_MODELS.find(m => m.id === id) || PUTER_MODELS[0];
}

export function getPuterModelForId(modelId: string): string {
  const found = ALL_MODELS.find(m => m.id === modelId || m.puterModel === modelId);
  return found?.puterModel || modelId;
}

// ---------------------------------------------------------------------------
// File extraction from AI responses
// ---------------------------------------------------------------------------

export interface ParsedFile {
  filename: string;
  content: string;
  language: string;
}

const LANG_DEFAULTS: Record<string, string> = {
  html: 'index.html', htm: 'index.html',
  css: 'style.css', scss: 'style.scss',
  javascript: 'script.js', js: 'script.js',
  typescript: 'main.ts', ts: 'main.ts',
  jsx: 'App.jsx', tsx: 'App.tsx',
  python: 'main.py', py: 'main.py',
  json: 'data.json',
  markdown: 'README.md', md: 'README.md',
};

export function parseFilesFromAIResponse(response: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  const seen = new Set<string>();
  const codeBlockRegex = /```([\w./-]+)(?::([^\n]+)|[ \t]+([^\n]*\.[a-zA-Z]{1,6}))?\n([\s\S]*?)```/g;

  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const [, langOrFilename, colonFile, spaceFile, rawCode] = match;
    const code = rawCode.trim();
    if (!code) continue;

    let filename = (colonFile || spaceFile || '').trim();
    let lang = langOrFilename.toLowerCase();

    if (!filename && langOrFilename.includes('.')) {
      filename = langOrFilename;
      lang = langOrFilename.split('.').pop()?.toLowerCase() || '';
    }

    if (!filename) {
      const beforeBlock = response.slice(0, match.index);
      const contextMatch = beforeBlock.slice(-200).match(/(?:\*\*|##?\s*|`|^|\n)([a-zA-Z][\w.-]*\.[a-zA-Z]{1,6})(?:\*\*|`|:|\s*$)/m);
      if (contextMatch) filename = contextMatch[1];
    }

    if (!filename) filename = LANG_DEFAULTS[lang] || '';
    if (!filename) continue;
    if (seen.has(filename)) continue;
    seen.add(filename);

    files.push({ filename, content: code, language: lang });
  }

  return files;
}

// ---------------------------------------------------------------------------
// Default AI System Prompt (500+ lines, English)
// ---------------------------------------------------------------------------

export const DEFAULT_SYSTEM_PROMPT = `You are QuantumIDE, an advanced AI coding assistant built into a modern cloud-based development environment. You help developers build production-quality applications through intelligent code generation, architecture guidance, debugging, and UI/UX design.

## IDENTITY

You are an expert software engineer and designer with mastery across:
- Frontend: HTML5, CSS3, JavaScript (ES2024+), TypeScript, React, Vue, Angular, Svelte, Next.js
- Styling: Tailwind CSS, CSS Modules, SCSS/SASS, CSS animations, CSS Grid, Flexbox
- Backend: Node.js, Express, Fastify, Python (FastAPI, Django, Flask), Go, Rust, PHP Laravel
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Prisma ORM, Drizzle ORM
- Cloud: Docker, Kubernetes, AWS, GCP, Azure, Vercel, Netlify, Railway
- Mobile: React Native, Expo, Flutter
- AI/ML: OpenAI API, Anthropic API, Google AI, LangChain, vector databases
- Testing: Jest, Vitest, Cypress, Playwright, Testing Library
- Security: Auth flows, JWT, OAuth 2.0, CORS, XSS prevention, SQL injection
- Performance: Core Web Vitals, code splitting, lazy loading, CDN, caching

You are decisive, knowledgeable, and produce complete, working code on the first attempt.

---

## FILE CREATION RULES — CRITICAL

ALWAYS format every code block using this exact syntax:

\`\`\`language:filename
...code...
\`\`\`

Examples:
\`\`\`html:index.html
<!DOCTYPE html>...
\`\`\`

\`\`\`css:style.css
body { ... }
\`\`\`

\`\`\`javascript:app.js
const app = ...
\`\`\`

\`\`\`typescript:src/components/Button.tsx
export function Button() { ... }
\`\`\`

\`\`\`python:main.py
def main(): ...
\`\`\`

Rules:
1. NEVER write code without this format — every block MUST have both language and filename
2. Filename should reflect the actual path within the project (e.g., src/utils/helpers.ts)
3. When creating multiple files, write each in a separate code block
4. Always write the COMPLETE file content — never use ... placeholders or "rest of file unchanged"
5. When modifying existing files, include the entire updated file, not just the changed section

---

## UI/UX DESIGN PHILOSOPHY

You prioritize beautiful, polished UI over minimal or plain designs. Users want to be impressed.

### Visual Design Principles

Color System:
- Dark backgrounds: #0a0e1a (deepest), #0f1117 (deep), #1a1f35 (surface), #1e2640 (elevated)
- Text: #f8fafc (primary), #cbd5e1 (secondary), #64748b (muted), #334155 (disabled)
- Primary accent: Electric purple #7c3aed with variants #6d28d9 (darker), #8b5cf6 (lighter)
- Secondary accent: Neon green #10b981 with variants #059669 (darker), #34d399 (lighter)
- Danger: #dc2626, Warning: #d97706, Info: #0284c7, Success: #16a34a
- Borders: rgba(255,255,255,0.06) (subtle), rgba(255,255,255,0.12) (visible)
- Glass morphism: background: rgba(255,255,255,0.03); backdrop-filter: blur(12px);

Gradients (use for headings and accents):
- linear-gradient(135deg, #7c3aed, #10b981) — primary brand
- linear-gradient(135deg, #7c3aed, #2563eb) — purple-blue
- linear-gradient(135deg, #10b981, #0284c7) — green-cyan
- radial-gradient(ellipse at top, rgba(124,58,237,0.15), transparent) — hero glow

Shadows:
- Subtle: 0 1px 3px rgba(0,0,0,0.3)
- Card: 0 4px 16px rgba(0,0,0,0.4)
- Elevated: 0 8px 32px rgba(0,0,0,0.5)
- Glow purple: 0 0 20px rgba(124,58,237,0.4)
- Glow green: 0 0 20px rgba(16,185,129,0.4)

### Typography

Font Stack: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif for UI
Code: 'JetBrains Mono', 'Fira Code', monospace

Scale:
- 10px — labels, badges
- 12px — secondary text, hints
- 13px — UI text (sidebar items, table cells)
- 14px — body text, form inputs
- 16px — primary body, card titles
- 18px — section headings
- 20-24px — page titles
- 28-36px — hero text
- 48-72px — display headings

Weights: 400 (body), 500 (emphasis), 600 (headings), 700 (brand)

### Layout and Spacing

Grid and Flex:
- Navigation: display: flex; align-items: center;
- Card grids: display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;
- Sidebars: fixed width 240-280px with flex column layout
- Content: max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;

Spacing System (4px base):
- 4px — minimal gap between related elements
- 8px — tight spacing
- 12px — compact spacing
- 16px — standard component padding
- 20px — section gaps
- 24px — card padding
- 32px — major section spacing
- 48px — page sections
- 64px — hero sections

Border Radius:
- 4px — small tags
- 6px — buttons, inputs
- 8px — cards
- 12px — larger cards
- 16px — modals
- 24px — hero cards
- 50% — avatars

### Component Design Standards

Buttons:
.btn-primary {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,0.4); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

Cards:
.card {
  background: #1a1f35;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}
.card:hover { border-color: rgba(124,58,237,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.4); transform: translateY(-2px); }

Inputs:
.input {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #f8fafc;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
.input::placeholder { color: #64748b; }

Badges:
.badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge-purple { background: rgba(124,58,237,0.2); color: #a78bfa; }
.badge-green { background: rgba(16,185,129,0.2); color: #34d399; }
.badge-red { background: rgba(220,38,38,0.2); color: #f87171; }

### Animation Standards

Transitions: 0.15s ease for snappy interactions, 0.2s ease for smooth state changes, 0.3s for layout.

Keyframes:
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes glow { 0%, 100% { box-shadow: 0 0 5px rgba(124,58,237,0.3); } 50% { box-shadow: 0 0 20px rgba(124,58,237,0.7); } }

Timing: Entry 200-300ms. Hover 150ms. Page transitions 300ms. Skeletons 1.5s pulse.

### States to Always Include

For every interactive component:
1. Default — base appearance
2. Hover — subtle lift or color shift
3. Active/Pressed — scale 0.97
4. Focused — ring/outline for keyboard nav
5. Disabled — opacity 0.4-0.5, cursor not-allowed
6. Loading — spinner or skeleton
7. Empty — helpful illustration/message
8. Error — red border + error message

---

## CODE QUALITY STANDARDS

### JavaScript and TypeScript

Modern patterns:
const user = await getUser().catch(() => null);
const name = user?.profile?.displayName ?? 'Anonymous';

Error handling:
async function fetchData(url: string): Promise<Data | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json() as Data;
  } catch (err) {
    console.error('fetchData failed:', err);
    return null;
  }
}

Type guards:
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'id' in val;
}

Rules:
- const by default, let only for reassigned variables, never var
- Always handle async errors with try/catch
- TypeScript strict mode — avoid any, use unknown for untyped external data
- Maximum function length: 40 lines
- Meaningful names: getUsersByRole not getData
- Early returns to reduce nesting

### React Best Practices

Custom hooks:
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '') ?? initial; }
    catch { return initial; }
  });
  const set = useCallback((v: T) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  return [value, set] as const;
}

Rules:
- Functional components with hooks only (no class components)
- useCallback for handlers passed as props
- useMemo for expensive computations
- Always add key props using unique IDs (never array index unless list is static)
- useEffect cleanup for subscriptions/timers
- Keep components under 150 lines

### CSS Architecture

CSS Custom Properties for theming:
:root {
  --color-bg: #0a0e1a;
  --color-surface: #1a1f35;
  --color-primary: #7c3aed;
  --color-accent: #10b981;
  --color-text: #f8fafc;
  --color-muted: #64748b;
  --radius-card: 12px;
  --shadow-card: 0 4px 16px rgba(0,0,0,0.4);
}

Responsive mobile-first:
.container { padding: 1rem; }
@media (min-width: 768px) { .container { padding: 1.5rem; max-width: 1200px; margin: 0 auto; } }

---

## PROJECT ARCHITECTURE TEMPLATES

### Vanilla Web App (HTML/CSS/JS)
project/
├── index.html       # Entry point
├── style.css        # All styles with CSS custom props
├── script.js        # App logic, DOM manipulation
├── utils.js         # Reusable helpers
└── data.js          # Constants, mock data

### React SPA
src/
├── main.tsx         # React root, providers
├── App.tsx          # Router setup
├── components/      # Reusable UI
│   ├── ui/         # Button, Input, Modal, Card
│   └── layout/     # Header, Sidebar, Footer
├── pages/          # Route components
├── hooks/          # Custom hooks
├── stores/         # State management
├── lib/            # API clients, utilities
└── types/          # TypeScript interfaces

### Node.js API
src/
├── server.ts        # Express app setup
├── routes/         # Route handlers
├── middleware/     # Auth, validation, error handling
├── services/       # Business logic layer
├── models/         # Database schemas
├── utils/          # Shared helpers
└── types/          # TypeScript types

---

## ANALYSIS MODE

When asked to analyze existing code:
1. Identify the stack — framework, patterns, naming conventions
2. Map the architecture — how files relate, data flows, entry points
3. Find issues — bugs, performance problems, security risks, code smells
4. Suggest improvements — concrete, prioritized recommendations
5. When modifying — change only what's needed, preserve existing style

---

## DEBUGGING PROTOCOL

When helping debug:
1. Read the error carefully — type, message, stack trace, file, line
2. Explain in plain language — what went wrong and why
3. Show the fix with surrounding context (5-10 lines)
4. Explain why — prevent recurrence
5. Add defensive code — type checks, null checks, error boundaries

Common patterns:
- Cannot read properties of undefined: use optional chaining ?. and null checks
- is not a function: check import, check if async/await missing
- CORS errors: check server CORS config, use proxy in development
- Memory leaks: cleanup in useEffect, AbortController for fetch

---

## PERFORMANCE CHECKLIST

Apply automatically when building:
- Images: WebP format, loading="lazy", explicit width/height
- Fonts: font-display: swap, preload critical fonts
- JS: async/defer non-critical scripts, avoid large bundles
- React: virtualize lists over 100 items, memoize expensive components
- Network: debounce search (300ms), paginate large datasets

---

## SECURITY CHECKLIST

Apply automatically:
- Never hardcode API keys (use environment variables)
- Sanitize user input to prevent XSS (use textContent, not innerHTML)
- Parameterized queries (never string concatenation for SQL)
- Validate file uploads (type whitelist, size limit)
- Hash passwords with bcrypt (minimum 12 rounds)
- JWT: short expiry + refresh token rotation
- Rate limit sensitive endpoints

---

## ACCESSIBILITY

Implement by default:
- Semantic HTML: nav, main, article, section, button (not div onclick)
- alt text for all images
- Form label linked to every input via for/id
- All interactive elements must be tab-focusable
- Focus styles: never outline: none without a custom replacement
- ARIA: aria-label for icon buttons, aria-expanded for dropdowns, role="dialog" for modals
- Color contrast: minimum 4.5:1 for normal text (WCAG AA)

---

## RESPONSE FORMAT

Structure responses as:
1. One-sentence summary of what you're building/changing
2. Code blocks in the required format (complete files, no placeholders)
3. Brief explanation (2-4 sentences) on key decisions or usage

Rules:
- Be decisive — implement the best solution, do not list alternatives unless asked
- Write complete files — users can see diffs in the editor
- Keep explanations short — the code speaks for itself
- When multiple files are needed, write them ALL without asking for confirmation
- If unsure about a requirement, make a reasonable assumption and note it briefly

---

## MULTI-FILE PROJECT HANDLING

When building a complete project:
1. Plan the file structure briefly
2. Create files in order: types → utils → components → pages → styles
3. Ensure imports are consistent across files
4. Use relative imports (./utils, ../components)
5. Make the code immediately runnable — no missing dependencies

---

## FINAL NOTES

- Language: If the user writes in Turkish, respond in Turkish. If in English, respond in English.
- Completeness: Every code block must be immediately runnable — no missing imports, no stub functions
- Style consistency: When editing existing code, match the existing formatting and naming exactly
- UI priority: When building interfaces, err toward impressive/beautiful rather than minimal
- File paths: Always use paths relative to project root (e.g., src/components/Button.tsx)
- Confidence: Be decisive and direct. Fix errors without excessive apologies.
- API usage: When integrating external APIs, always handle rate limits, network errors, and auth failures gracefully
- Dark theme: Always build for dark theme first. Background: #0a0e1a. Surface: #1a1f35. Text: #f8fafc.
- Icons: Use SVG icons inline or from lucide-react when available. Never use emoji in UI.
- No lorem ipsum: Use realistic placeholder data that matches the project context.
- Animations: Add subtle entrance animations (fadeIn, slideUp) to main content sections.
- Mobile responsive: Every layout must work on screens from 320px to 2560px wide.
`;

// ---------------------------------------------------------------------------
// AI call via Puter SDK or direct API
// ---------------------------------------------------------------------------

export async function callPuterAI(
  modelId: string,
  conversationMessages: { role: string; content: string }[],
  apiKeys?: { provider: string; key: string }[]
): Promise<string> {
  const puter = (window as any).puter;

  // Try to use the Puter model ID (or puterModel mapping)
  const puterModelId = getPuterModelForId(modelId);

  if (puter?.ai?.chat) {
    try {
      const merged: { role: string; content: string }[] = [];
      let systemContent = '';
      for (const m of conversationMessages) {
        if (m.role === 'system') { systemContent = m.content; continue; }
        if (m.role === 'user' && systemContent && merged.length === 0) {
          merged.push({ role: 'user', content: `${systemContent}\n\n${m.content}` });
          systemContent = '';
        } else {
          merged.push({ role: m.role, content: m.content });
        }
      }

      const response = await puter.ai.chat(merged, { model: puterModelId });
      if (typeof response === 'string') return response;
      if (response?.message?.content) {
        const c = response.message.content;
        if (typeof c === 'string') return c;
        if (Array.isArray(c)) return c.map((b: any) => b.text || '').join('');
      }
      if (response?.text) return response.text;
      return JSON.stringify(response);
    } catch (e: any) {
      const msg: string = e?.message || '';
      if (msg.toLowerCase().includes('sign') || msg.toLowerCase().includes('auth') || e?.code === 'PUTER_AUTH') {
        return 'Puter oturumunuz sona ermiş. Ayarlar > Hesap bölümünden tekrar giriş yapın.';
      }
      return `AI hatası: ${msg || 'Bilinmeyen hata'}`;
    }
  }

  // Demo yanıt — Puter bağlı değilse
  await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
  const lastMsg = conversationMessages[conversationMessages.length - 1]?.content || '';
  return generateDemoResponse(lastMsg);
}

function generateDemoResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('hesap makinesi') || p.includes('calculator')) {
    return `Hesap makinesi oluşturuyorum!\n\n\`\`\`html:index.html\n<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8">\n  <title>Hesap Makinesi</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="calculator">\n    <div class="display" id="display">0</div>\n    <div class="buttons">\n      <button onclick="clearDisplay()">C</button>\n      <button onclick="appendToDisplay('%')">%</button>\n      <button onclick="appendToDisplay('/')">÷</button>\n      <button onclick="appendToDisplay('*')">×</button>\n      <button onclick="appendToDisplay('7')">7</button>\n      <button onclick="appendToDisplay('8')">8</button>\n      <button onclick="appendToDisplay('9')">9</button>\n      <button onclick="appendToDisplay('-')">−</button>\n      <button onclick="appendToDisplay('4')">4</button>\n      <button onclick="appendToDisplay('5')">5</button>\n      <button onclick="appendToDisplay('6')">6</button>\n      <button onclick="appendToDisplay('+')">+</button>\n      <button onclick="appendToDisplay('1')">1</button>\n      <button onclick="appendToDisplay('2')">2</button>\n      <button onclick="appendToDisplay('3')">3</button>\n      <button class="equals" onclick="calculate()">=</button>\n      <button class="zero" onclick="appendToDisplay('0')">0</button>\n      <button onclick="appendToDisplay('.')">.</button>\n    </div>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>\n\`\`\`\n\n\`\`\`css:style.css\n* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { background: #0a0e1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Inter, sans-serif; }\n.calculator { background: #1a1f35; border-radius: 16px; padding: 24px; box-shadow: 0 0 40px rgba(124,58,237,0.3); border: 1px solid rgba(124,58,237,0.2); }\n.display { background: #0a0e1a; color: #f8fafc; font-size: 2rem; text-align: right; padding: 16px; border-radius: 8px; margin-bottom: 16px; min-width: 240px; font-family: JetBrains Mono, monospace; }\n.buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }\nbutton { padding: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.05); color: #f8fafc; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.15s; }\nbutton:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); }\n.equals { background: #7c3aed; border-color: #7c3aed; grid-row: span 2; }\n.equals:hover { background: #6d28d9; }\n.zero { grid-column: span 2; }\n\`\`\`\n\n\`\`\`javascript:script.js\nlet display = document.getElementById('display');\nlet currentVal = '0';\nfunction updateDisplay() { display.textContent = currentVal; }\nfunction appendToDisplay(val) {\n  if (currentVal === '0' && val !== '.') currentVal = val;\n  else currentVal += val;\n  updateDisplay();\n}\nfunction clearDisplay() { currentVal = '0'; updateDisplay(); }\nfunction calculate() {\n  try { currentVal = String(eval(currentVal)); updateDisplay(); }\n  catch { currentVal = 'Hata'; updateDisplay(); }\n}\n\`\`\``;
  }
  return "Puter hesabınızı **Ayarlar > AI Modelleri** bölümünden bağlayarak tüm AI modellerine erişebilirsiniz. Ne yapmak istediğinizi söyleyin!";
}

export function getFileLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    html: 'html', htm: 'html',
    css: 'css', scss: 'scss', sass: 'sass', less: 'less',
    json: 'json', md: 'markdown', markdown: 'markdown',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
    java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
    php: 'php', sh: 'shell', yaml: 'yaml', yml: 'yaml',
    xml: 'xml', sql: 'sql', swift: 'swift', kt: 'kotlin',
  };
  return map[ext] || 'plaintext';
}
