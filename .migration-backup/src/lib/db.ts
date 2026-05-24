const DB_NAME = 'quantum-ide-db';
const DB_VERSION = 1;

let _db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv');
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

// Projects
export async function dbSaveProjects(projects: object[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    store.clear();
    for (const p of projects) store.put(p);
    return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  } catch {
    localStorage.setItem('qide_projects', JSON.stringify(projects));
  }
}

export async function dbLoadProjects(): Promise<object[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('projects', 'readonly');
    const req = tx.objectStore('projects').getAll();
    return new Promise((res, rej) => {
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  } catch {
    try { return JSON.parse(localStorage.getItem('qide_projects') || '[]'); } catch { return []; }
  }
}

// Key-value store (messages, settings, user)
export async function dbSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, key);
    return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  } catch {
    localStorage.setItem(`qide_${key}`, JSON.stringify(value));
  }
}

export async function dbGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await openDB();
    const tx = db.transaction('kv', 'readonly');
    const req = tx.objectStore('kv').get(key);
    return new Promise((res, rej) => {
      req.onsuccess = () => res(req.result !== undefined ? req.result as T : fallback);
      req.onerror = () => rej(req.error);
    });
  } catch {
    try { return JSON.parse(localStorage.getItem(`qide_${key}`) || 'null') ?? fallback; } catch { return fallback; }
  }
}
