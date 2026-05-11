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

export function getModelById(id: string): PuterAIModel {
  return PUTER_MODELS.find(m => m.id === id) || PUTER_MODELS[0];
}

// ---------------------------------------------------------------------------
// File extraction from AI responses
// ---------------------------------------------------------------------------

export interface ParsedFile {
  filename: string;
  content: string;
  language: string;
}

// Default filenames by language when AI doesn't specify one
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

  // Pattern 1: ```lang:filename.ext (e.g. ```html:index.html)
  // Pattern 2: ```lang filename.ext (e.g. ```javascript script.js)
  // Pattern 3: ```filename.ext     (e.g. ```index.html)
  const codeBlockRegex = /```([\w./-]+)(?::([^\n]+)|[ \t]+([^\n]*\.[a-zA-Z]{1,6}))?\n([\s\S]*?)```/g;

  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const [, langOrFilename, colonFile, spaceFile, rawCode] = match;
    const code = rawCode.trim();
    if (!code) continue;

    let filename = (colonFile || spaceFile || '').trim();
    let lang = langOrFilename.toLowerCase();

    // If langOrFilename itself looks like a filename (has extension)
    if (!filename && langOrFilename.includes('.')) {
      filename = langOrFilename;
      lang = langOrFilename.split('.').pop()?.toLowerCase() || '';
    }

    // If still no filename, look for context before this block
    if (!filename) {
      const beforeBlock = response.slice(0, match.index);
      // Look for "**filename.ext**" or "# filename.ext" or "filename.ext:" in last 200 chars
      const contextMatch = beforeBlock.slice(-200).match(/(?:\*\*|##?\s*|`|^|\n)([a-zA-Z][\w.-]*\.[a-zA-Z]{1,6})(?:\*\*|`|:|\s*$)/m);
      if (contextMatch) filename = contextMatch[1];
    }

    // Fallback to language default
    if (!filename) {
      filename = LANG_DEFAULTS[lang] || '';
    }

    if (!filename) continue;
    // Deduplicate — keep first occurrence
    if (seen.has(filename)) continue;
    seen.add(filename);

    files.push({ filename, content: code, language: lang });
  }

  return files;
}

// ---------------------------------------------------------------------------
// AI call via Puter SDK
// ---------------------------------------------------------------------------

export const AI_SYSTEM_PROMPT = `Sen QuantumIDE yapay zeka asistanısın. Türkçe yanıt veriyorsun.
Kod yazma, hata ayıklama ve proje geliştirme konularında yardım ediyorsun.

KOD YAZARKEN ZORUNLU KURAL:
Her kod bloğunu şu formatta yaz — dil:dosyaadı
Örnekler:
\`\`\`html:index.html
...kod...
\`\`\`

\`\`\`css:style.css
...kod...
\`\`\`

\`\`\`javascript:script.js
...kod...
\`\`\`

Bu format sayesinde kodlar otomatik olarak editördeki dosyalara kaydedilir.
Kısa ve öz cevaplar ver. Birden fazla dosya gerekiyorsa hepsini ayrı bloklarda yaz.`;

export async function callPuterAI(
  modelId: string,
  conversationMessages: { role: string; content: string }[]
): Promise<string> {
  const puter = (window as any).puter;

  if (puter?.ai?.chat) {
    try {
      // Puter doesn't support 'system' role — merge into first user message
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

      const response = await puter.ai.chat(merged, { model: modelId });
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
        return 'Puter hesabınıza giriş yapmanız gerekiyor. Ayarlar > AI Modelleri bölümünden Puter hesabınızı bağlayın.';
      }
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('model')) {
        return `Model bulunamadı: "${modelId}". Lütfen AI Panelinden farklı bir model seçin.`;
      }
      return `Puter AI hatası: ${msg || 'Bilinmeyen hata'}`;
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
    return `Hesap makinesi oluşturuyorum!\n\n\`\`\`html:index.html\n<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8">\n  <title>Hesap Makinesi</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="calculator">\n    <div class="display" id="display">0</div>\n    <div class="buttons">\n      <button onclick="clearDisplay()">C</button>\n      <button onclick="appendToDisplay('%')">%</button>\n      <button onclick="appendToDisplay('/')">÷</button>\n      <button onclick="appendToDisplay('*')">×</button>\n      <button onclick="appendToDisplay('7')">7</button>\n      <button onclick="appendToDisplay('8')">8</button>\n      <button onclick="appendToDisplay('9')">9</button>\n      <button onclick="appendToDisplay('-')">−</button>\n      <button onclick="appendToDisplay('4')">4</button>\n      <button onclick="appendToDisplay('5')">5</button>\n      <button onclick="appendToDisplay('6')">6</button>\n      <button onclick="appendToDisplay('+')">+</button>\n      <button onclick="appendToDisplay('1')">1</button>\n      <button onclick="appendToDisplay('2')">2</button>\n      <button onclick="appendToDisplay('3')">3</button>\n      <button class="equals" onclick="calculate()">=</button>\n      <button class="zero" onclick="appendToDisplay('0')">0</button>\n      <button onclick="appendToDisplay('.')">.</button>\n    </div>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>\n\`\`\`\n\n\`\`\`css:style.css\n* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { background: #0a0e1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; }\n.calculator { background: #1a1f35; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 0 40px rgba(124,58,237,0.3); }\n.display { background: #0a0e1a; color: #e2e8f0; font-size: 2rem; text-align: right; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; min-width: 240px; }\n.buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }\nbutton { padding: 1rem; border: none; border-radius: 0.5rem; background: #2d3555; color: #e2e8f0; font-size: 1.1rem; cursor: pointer; transition: all 0.15s; }\nbutton:hover { background: #7c3aed; }\n.equals { background: #7c3aed; grid-row: span 2; }\n.zero { grid-column: span 2; }\n\`\`\`\n\n\`\`\`javascript:script.js\nlet display = document.getElementById('display');\nfunction appendToDisplay(val) { display.textContent = display.textContent === '0' ? val : display.textContent + val; }\nfunction clearDisplay() { display.textContent = '0'; }\nfunction calculate() { try { display.textContent = eval(display.textContent); } catch { display.textContent = 'Hata'; } }\n\`\`\``;
  }
  if (p.includes('todo') || p.includes('yapılacak')) {
    return `Todo listesi oluşturuyorum!\n\n\`\`\`html:index.html\n<!DOCTYPE html>\n<html lang="tr">\n<head><meta charset="UTF-8"><title>Todo</title><link rel="stylesheet" href="style.css"></head>\n<body>\n  <div class="app">\n    <h1>Yapılacaklar</h1>\n    <div class="input-group">\n      <input type="text" id="todo-input" placeholder="Yeni görev ekle...">\n      <button onclick="addTodo()">Ekle</button>\n    </div>\n    <ul id="todo-list"></ul>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>\n\`\`\`\n\n\`\`\`css:style.css\nbody { background: #0a0e1a; color: #e2e8f0; font-family: sans-serif; display: flex; justify-content: center; padding: 2rem; }\n.app { max-width: 500px; width: 100%; }\nh1 { color: #7c3aed; margin-bottom: 1.5rem; }\n.input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; }\ninput { flex: 1; padding: 0.75rem; background: #1a1f35; border: 1px solid #333; border-radius: 0.5rem; color: #e2e8f0; font-size: 0.9rem; }\nbutton { padding: 0.75rem 1.5rem; background: #7c3aed; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }\nli { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #1a1f35; border-radius: 0.5rem; margin-bottom: 0.5rem; }\nli.done span { text-decoration: line-through; opacity: 0.5; }\n.del { margin-left: auto; background: #dc2626; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; }\n\`\`\`\n\n\`\`\`javascript:script.js\nconst list = document.getElementById('todo-list');\nconst input = document.getElementById('todo-input');\nfunction addTodo() {\n  if (!input.value.trim()) return;\n  const li = document.createElement('li');\n  const cb = document.createElement('input'); cb.type = 'checkbox';\n  cb.onchange = () => li.classList.toggle('done', cb.checked);\n  const span = document.createElement('span'); span.textContent = input.value;\n  const del = document.createElement('button'); del.textContent = 'Sil'; del.className = 'del';\n  del.onclick = () => li.remove();\n  li.append(cb, span, del); list.appendChild(li); input.value = '';\n}\ninput.addEventListener('keydown', e => e.key === 'Enter' && addTodo());\n\`\`\``;
  }
  if (p.includes('hata') || p.includes('bug') || p.includes('error')) {
    return "Hatayı inceliyorum...\n\n```javascript:script.js\n// Optional chaining ile güvenli erişim\nconst deger = nesne?.ozellik?.alt ?? 'varsayılan';\n\n// Try-catch ile hata yönetimi\ntry {\n  const sonuc = await fetch(url);\n  const data = await sonuc.json();\n} catch (e) {\n  console.error('Hata:', e);\n}\n```\n\nPuter hesabınızı bağlayarak daha detaylı yardım alabilirsiniz.";
  }
  const demos = [
    "Puter hesabınızı **Ayarlar > AI Modelleri** bölümünden bağlayarak tüm AI modellerine **ücretsiz** erişebilirsiniz.",
    "Ne yapmak istediğinizi söyleyin — bir uygulama, oyun veya araç oluşturayım!",
  ];
  return demos[Math.floor(Math.random() * demos.length)];
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
