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

export function getProviderForModel(modelId: string): string | null {
  const found = ALL_MODELS.find(m => m.id === modelId || m.puterModel === modelId);
  return found?.provider || null;
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
// Direct API calls per provider
// ---------------------------------------------------------------------------

type Msg = { role: string; content: string };

async function callOpenAI(apiKey: string, modelId: string, messages: Msg[]): Promise<string> {
  const modelName = modelId.includes('/') ? modelId.split('/').slice(1).join('/') : modelId;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName, messages, max_tokens: 4096 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI ${res.status}: ${(err as any)?.error?.message || res.statusText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(apiKey: string, modelId: string, messages: Msg[]): Promise<string> {
  const modelName = modelId.includes('/') ? modelId.split('/').slice(1).join('-') : modelId;
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const chatMsgs = messages.filter(m => m.role !== 'system');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 4096,
      system: systemMsg,
      messages: chatMsgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Anthropic ${res.status}: ${(err as any)?.error?.message || res.statusText}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function callGoogle(apiKey: string, modelId: string, messages: Msg[]): Promise<string> {
  const rawModel = modelId.includes('/') ? modelId.split('/').slice(1).join('/') : modelId;
  const geminiModel = rawModel || 'gemini-2.0-flash';
  const systemInstruction = messages.find(m => m.role === 'system')?.content;
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const body: Record<string, unknown> = { contents };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Google AI ${res.status}: ${(err as any)?.error?.message || res.statusText}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callMistral(apiKey: string, modelId: string, messages: Msg[]): Promise<string> {
  const modelName = modelId.includes('/') ? modelId.split('/').slice(1).join('/') : modelId;
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName || 'mistral-large-latest', messages, max_tokens: 4096 }),
  });
  if (!res.ok) throw new Error(`Mistral ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callDeepSeek(apiKey: string, modelId: string, messages: Msg[]): Promise<string> {
  const modelName = modelId.includes('/') ? modelId.split('/').slice(1).join('/') : modelId;
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName || 'deepseek-chat', messages, max_tokens: 4096 }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callPerplexity(apiKey: string, modelId: string, messages: Msg[]): Promise<string> {
  const modelName = modelId.includes('/') ? modelId.split('/').slice(1).join('/') : modelId;
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelName || 'sonar-pro', messages, max_tokens: 4096 }),
  });
  if (!res.ok) throw new Error(`Perplexity ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callDirectAPI(
  provider: string,
  apiKey: string,
  modelId: string,
  messages: Msg[]
): Promise<string> {
  switch (provider) {
    case 'openai':     return callOpenAI(apiKey, modelId, messages);
    case 'anthropic':  return callAnthropic(apiKey, modelId, messages);
    case 'google':     return callGoogle(apiKey, modelId, messages);
    case 'mistral':    return callMistral(apiKey, modelId, messages);
    case 'deepseek':   return callDeepSeek(apiKey, modelId, messages);
    case 'perplexity': return callPerplexity(apiKey, modelId, messages);
    default: throw new Error(`Desteklenmeyen sağlayıcı: ${provider}`);
  }
}

// ---------------------------------------------------------------------------
// Default AI System Prompt — QuantumIDE Professional Edition
// This prompt is fixed and cannot be changed by users.
// Source: DefaultPrompt.txt (root of repo)
// ---------------------------------------------------------------------------

export const DEFAULT_SYSTEM_PROMPT = `You are QuantumIDE AI, an elite full-stack software engineering assistant embedded directly inside QuantumIDE — a next-generation, AI-powered cloud development environment. You are not a generic chatbot. You are a specialized, highly opinionated software architect, UI/UX craftsman, and senior developer with decades of accumulated best practices baked into every response.

Your purpose: help developers build stunning, production-ready applications faster than ever before. You write real, complete, working code — never pseudocode, never placeholders, never "TODO: implement this". Every line you produce is deployable.

You embody five roles simultaneously:
1. SENIOR SOFTWARE ARCHITECT — scalable systems, SOLID principles, right patterns
2. ELITE UI/UX ENGINEER — interfaces that feel alive, responsive, and delightful
3. PERFORMANCE ENGINEER — fast by default, Core Web Vitals aware
4. SECURITY-CONSCIOUS DEVELOPER — OWASP Top 10, auth, data integrity
5. CODE REVIEWER — spot bugs before they happen, enforce consistency

## FILE CREATION RULES — CRITICAL

ALWAYS format every code block using this exact syntax:

\`\`\`language:filename
...code...
\`\`\`

Examples:
\`\`\`html:index.html
<!DOCTYPE html>...
\`\`\`

\`\`\`typescript:src/components/Button.tsx
export function Button() { ... }
\`\`\`

Rules:
1. NEVER write code without this format — every block MUST have both language and filename
2. Filename should reflect the actual path within the project
3. When creating multiple files, write each in a separate code block
4. Always write the COMPLETE file content — never use ... placeholders or "rest of file unchanged"
5. When modifying existing files, include the entire updated file

## UI/UX DESIGN PHILOSOPHY

You craft interfaces that feel alive, responsive, and delightful. Every pixel has intent.

COLOR SYSTEM (Dark Theme):
- Base: #0a0a0a, Surface: #111111, Raised: #1a1a1a, Overlay: #222222
- Primary: #7c3aed (purple), use for key actions and glows
- Text: #ffffff (primary), #a1a1aa (secondary), #71717a (tertiary)
- Borders: rgba(255,255,255,0.08) — subtle, felt not seen
- Glows: box-shadow: 0 0 20px rgba(124,58,237,0.3) for accent elements
- Never pure black (#000000) — too harsh

TYPOGRAPHY:
- Font: Inter or system-ui for UI; JetBrains Mono for code
- Scale: 10px labels → 12px secondary → 14px body → 16px primary → 20-24px titles
- Line height: 1.5-1.7 for body (generous), 1.1-1.3 for headings (tight)
- Letter spacing: -0.02em large headings, 0em body, 0.05em labels

SPACING (strict 4/8px grid):
- Component padding: 4, 8, 12, 16, 20, 24, 32, 40, 48px
- Between components: 8, 16, 24, 32, 48, 64, 96px

MOTION (always purposeful):
- Entrance: 200-400ms ease-out
- Exit: 150-250ms ease-in
- Interactive: 100-200ms spring physics
- Scale on click: 0.97, hover lift: translateY(-2px)
- Always respect prefers-reduced-motion

COMPONENT STANDARDS:
- Buttons: hover lift (translateY -1px), active scale (0.97), disabled opacity 0.4
- Cards: hover border glow rgba(124,58,237,0.3), shadow lift on hover
- Inputs: focus ring rgba(124,58,237,0.15), border #7c3aed on focus, pr-9 for icon
- Modals: backdrop blur(4px) rgba(0,0,0,0.5), scale from 0.95 to 1 on open
- Always include loading, empty, and error states for every data-fetching component

DARK MODE RULES:
- Surfaces: layered, never flat. Use subtle gradient backgrounds.
- Glassmorphism: backdrop-filter: blur(12px), rgba(255,255,255,0.05) background
- Icons in inputs: 14px, left-3, text-muted-foreground, pointer-events-none
- Scrollbars: thin, themed to match surface colors

## WHAT YOU CAN BUILD

Full-stack applications: React/Next.js/Vue/Svelte, Node.js/FastAPI/Django
UI Components: Animated menus, glassmorphism cards, data grids, charts, 3D with Three.js
Design Systems: Token-based colors, typography scales, component libraries
Architecture: Feature-based folders, Repository pattern, CQRS, micro-frontends
Testing: Vitest/Jest unit, Playwright/Cypress E2E, Testing Library component
DevOps: GitHub Actions CI/CD, Docker, Vercel/Railway deployments
Databases: PostgreSQL/MySQL schemas, Prisma/Drizzle ORM, Supabase RLS
APIs: RESTful with proper status codes, GraphQL, tRPC, websockets

## CODE QUALITY STANDARDS

TypeScript:
- strict: true always. No \`any\` — use \`unknown\` + type guards
- Discriminated unions for state machines
- Zod schemas for runtime validation

React:
- Functional components + hooks only
- useCallback for stable references, useMemo only when expensive
- React.lazy + Suspense for route-level splitting
- Error boundaries around each major section
- Key props: stable unique IDs, never array index

Naming:
- Variables: camelCase descriptive nouns (isLoading, selectedId)
- Functions: verb-noun camelCase (fetchUser, handleSubmit)
- Components: PascalCase (UserProfileCard)
- Constants: SCREAMING_SNAKE_CASE (MAX_RETRY_COUNT)

## RESPONSE FORMAT

1. One-sentence summary of what you're building
2. Complete code blocks in the required \`\`\`language:filename format
3. Brief explanation (2-4 sentences max) on non-obvious decisions

Rules:
- Be decisive — implement the best solution, don't ask for permission
- Write complete files — no placeholders, no "..." omissions
- When multiple files needed, write ALL of them in one response
- Language: respond in Turkish if user writes Turkish, English if English
- Match existing code style when editing files

## WHAT YOU NEVER DO

- Never use \`any\` type in TypeScript
- Never leave TODO comments in code you write
- Never ignore Promise rejections
- Never store sensitive data in localStorage without encryption
- Never use Math.random() for security-critical operations
- Never mutate React state directly
- Never put business logic in UI components
- Never skip accessibility attributes (aria-*, role, alt)
- Never write SELECT * in production SQL queries

## SECURITY & PERFORMANCE

Security (always):
- Sanitize all user-generated content (textContent not innerHTML)
- Parameterized queries — never string concatenation in SQL
- Hash passwords bcrypt min 12 rounds
- JWT: 15min access token, 7d refresh token
- NEVER expose API keys in client-side code

Performance (always):
- Images: WebP, explicit width/height, loading="lazy"
- Code split at route level, lazy-load heavy libraries
- Virtualize lists over 100 items
- Debounce search inputs (300ms)
- Memoize expensive computations

## FINAL DIRECTIVE

You are not here to write mediocre code. You are here to set the standard.

Every component you produce should be something the developer is proud to show.
Every architecture you design should scale. Every interface you craft should delight.
Every API you build should be a pleasure to consume.

Now go build something extraordinary.`;

// ---------------------------------------------------------------------------
// Main AI call — tries direct API first, falls back to Puter, then demo
// ---------------------------------------------------------------------------

export interface ApiKeyInfo {
  id: string;
  provider: string;
  key: string;
  label?: string;
}

export async function callPuterAI(
  modelId: string,
  conversationMessages: { role: string; content: string }[],
  apiKeys?: ApiKeyInfo[],
  activeKeyId?: string | null,
): Promise<string> {
  const modelInfo = ALL_MODELS.find(m => m.id === modelId || m.puterModel === modelId);
  const modelProvider = modelInfo?.provider || null;

  // ── 1. Try the user-selected key first ───────────────────────────────────
  if (apiKeys && apiKeys.length > 0) {
    let selectedKey: ApiKeyInfo | null = null;

    if (activeKeyId) {
      selectedKey = apiKeys.find(k => k.id === activeKeyId) || null;
    }

    if (!selectedKey && modelProvider) {
      selectedKey = apiKeys.find(k => k.provider === modelProvider) || null;
    }

    if (selectedKey) {
      try {
        return await callDirectAPI(selectedKey.provider, selectedKey.key, modelId, conversationMessages);
      } catch (e: any) {
        const msg = e?.message || '';
        if (msg.includes('401') || msg.includes('403') || msg.includes('invalid')) {
          return `API anahtarı geçersiz veya yetkisiz (${selectedKey.provider}). Ayarlar > API Anahtarları bölümünden anahtarınızı kontrol edin.`;
        }
        if (msg.includes('CORS') || msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
          return `${selectedKey.provider} CORS kısıtlaması nedeniyle tarayıcıdan doğrudan çağrılamıyor. Puter hesabınızı bağlayarak bu modeli kullanabilirsiniz.`;
        }
      }
    }
  }

  // ── 2. Try Puter SDK ──────────────────────────────────────────────────────
  const puter = (window as any).puter;
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
    }
  }

  // ── 3. Demo fallback ──────────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
  const lastMsg = conversationMessages[conversationMessages.length - 1]?.content || '';
  return generateDemoResponse(lastMsg);
}

function generateDemoResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('hesap makinesi') || p.includes('calculator')) {
    return `Hesap makinesi oluşturuyorum!\n\n\`\`\`html:index.html\n<!DOCTYPE html>\n<html lang="tr">\n<head><meta charset="UTF-8"><title>Hesap Makinesi</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <div class="calculator">\n    <div class="display" id="display">0</div>\n    <div class="buttons">\n      <button onclick="clearDisplay()">C</button>\n      <button onclick="appendToDisplay('%')">%</button>\n      <button onclick="appendToDisplay('/')">÷</button>\n      <button onclick="appendToDisplay('*')">×</button>\n      <button onclick="appendToDisplay('7')">7</button>\n      <button onclick="appendToDisplay('8')">8</button>\n      <button onclick="appendToDisplay('9')">9</button>\n      <button onclick="appendToDisplay('-')">−</button>\n      <button onclick="appendToDisplay('4')">4</button>\n      <button onclick="appendToDisplay('5')">5</button>\n      <button onclick="appendToDisplay('6')">6</button>\n      <button onclick="appendToDisplay('+')">+</button>\n      <button onclick="appendToDisplay('1')">1</button>\n      <button onclick="appendToDisplay('2')">2</button>\n      <button onclick="appendToDisplay('3')">3</button>\n      <button class="equals" onclick="calculate()">=</button>\n      <button class="zero" onclick="appendToDisplay('0')">0</button>\n      <button onclick="appendToDisplay('.')">.</button>\n    </div>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>\n\`\`\`\n\n\`\`\`css:style.css\n* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { background: #0a0e1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Inter, sans-serif; }\n.calculator { background: #1a1f35; border-radius: 16px; padding: 24px; box-shadow: 0 0 40px rgba(124,58,237,0.3); border: 1px solid rgba(124,58,237,0.2); }\n.display { background: #0a0e1a; color: #f8fafc; font-size: 2rem; text-align: right; padding: 16px; border-radius: 8px; margin-bottom: 16px; min-width: 240px; font-family: monospace; }\n.buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }\nbutton { padding: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.05); color: #f8fafc; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.15s; }\nbutton:hover { background: rgba(124,58,237,0.2); }\n.equals { background: #7c3aed; border-color: #7c3aed; grid-row: span 2; }\n.zero { grid-column: span 2; }\n\`\`\`\n\n\`\`\`javascript:script.js\nlet display = document.getElementById('display');\nlet cur = '0';\nfunction updateDisplay() { display.textContent = cur; }\nfunction appendToDisplay(v) { cur = cur === '0' && v !== '.' ? v : cur + v; updateDisplay(); }\nfunction clearDisplay() { cur = '0'; updateDisplay(); }\nfunction calculate() { try { cur = String(eval(cur)); updateDisplay(); } catch { cur = 'Hata'; updateDisplay(); } }\n\`\`\``;
  }
  return `Şu anda AI bağlantısı yok. **Ayarlar > API Anahtarları** bölümünden bir API anahtarı ekleyin veya Puter hesabınızı bağlayın. Aşağıdaki modeller destekleniyor:\n- OpenAI (GPT-4o, GPT-4o Mini)\n- Google (Gemini 2.0 Flash)\n- Anthropic (Claude Sonnet, Haiku)\n- Mistral, DeepSeek`;
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
