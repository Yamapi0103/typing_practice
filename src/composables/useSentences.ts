import { ref } from "vue";
import { SENTENCES, type Sentence } from "../data/sentences";

type Level = 1 | 2 | 3;
export type Lang = "zh" | "en";

// Dev: Vite proxy at /rss/...  Production: Vercel Edge Function
const RSS_PATH =
  import.meta.env.VITE_RSS_API ?? "/rss/Rss_News.aspx?n=9E7AC85F1954DDA8";
const EN_API =
  import.meta.env.VITE_DATA_API ?? "/typefit/data/typing-texts.json";

const storedLang = localStorage.getItem("lang");
const lang = ref<Lang>(
  storedLang === "en" || storedLang === "zh" ? storedLang : "zh",
);

// Sentence pools
const zhSentences = ref<Sentence[]>([...SENTENCES]);
const enSentences = ref<Sentence[]>([]);
const loading = ref(false);

let zhFetched = false;

// Queue per lang+level — tracks remaining unused sentences
const queues: Record<string, Sentence[]> = {};

function assignZhLevel(len: number): Level {
  if (len <= 10) return 1;
  if (len <= 20) return 2;
  return 3;
}

function isChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function currentPool(level: Level | null): Sentence[] {
  const pool = lang.value === "en" ? enSentences.value : zhSentences.value;
  const filtered = level ? pool.filter(s => s.level === level) : pool;
  return filtered.length > 0 ? filtered : pool;
}

function buildQueue(level: Level | null): void {
  const key = `${lang.value}_${level}`;
  const arr = [...currentPool(level)];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const shuffled = arr;
  queues[key] = shuffled;
}

function getQueue(level: Level | null): Sentence[] {
  const key = `${lang.value}_${level}`;
  if (!queues[key] || queues[key].length === 0) buildQueue(level);
  return queues[key];
}

async function fetchZh(): Promise<void> {
  if (zhFetched) return;
  loading.value = true;
  try {
    const res = await fetch(RSS_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, "text/xml");
    const parsed: Sentence[] = [];
    for (const el of doc.querySelectorAll("item > title")) {
      const t = el.textContent?.trim() ?? "";
      if (t.length < 5 || t.length > 40 || !isChinese(t)) continue;
      parsed.push({ text: t, level: assignZhLevel(t.length) });
    }
    if (parsed.length > 0) {
      zhSentences.value = parsed;
      zhFetched = true;
      Object.keys(queues)
        .filter(k => k.startsWith("zh"))
        .forEach(k => delete queues[k]);
    }
  } catch {
    // fallback to static sentences
  } finally {
    loading.value = false;
  }
}

async function fetchEn(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetch(EN_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { text: string; difficulty: string }[] = await res.json();
    const diffMap: Record<string, Level> = { easy: 1, medium: 2, hard: 3 };
    const parsed: Sentence[] = data
      .filter(q => q.text)
      .sort(() => Math.random() - 0.5)
      .map(q => ({ text: q.text.trim(), level: diffMap[q.difficulty] ?? 2 }));
    if (parsed.length > 0) {
      enSentences.value = parsed;
      Object.keys(queues)
        .filter(k => k.startsWith("en"))
        .forEach(k => delete queues[k]);
    }
  } catch {
    // no fallback for English
  } finally {
    loading.value = false;
  }
}

function switchLang(l: Lang): void {
  lang.value = l;
  localStorage.setItem("lang", l);
  if (l === "en") fetchEn();
}

function getRandomSentence(level: Level | null = null): Sentence {
  return (
    getQueue(level).pop() ??
    SENTENCES[Math.floor(Math.random() * SENTENCES.length)]
  );
}

export function useSentences() {
  return { lang, loading, fetchZh, fetchEn, switchLang, getRandomSentence };
}
