import { ref } from 'vue'
import { SENTENCES, type Sentence } from '../data/sentences'

type Level = 1 | 2 | 3

// Dev: Vite proxy at /rss/...  Production: Vercel Edge Function
const RSS_PATH = import.meta.env.VITE_RSS_API ?? '/rss/Rss_News.aspx?n=9E7AC85F1954DDA8'

// Shared state — fetched once, reused across component instances
const sentences = ref<Sentence[]>([...SENTENCES])
const loading = ref(false)
let fetched = false

function isChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text)
}

function assignLevel(len: number): Level {
  if (len <= 10) return 1
  if (len <= 20) return 2
  return 3
}

async function fetchSentences(): Promise<void> {
  if (fetched) return
  loading.value = true
  try {
    const res = await fetch(RSS_PATH)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    console.log("🚀 ~ fetchSentences ~ text:", text)
    const doc = new DOMParser().parseFromString(text, 'text/xml')
    const titles = Array.from(doc.querySelectorAll('item > title'))
    const parsed: Sentence[] = []
    for (const el of titles) {
      const t = el.textContent?.trim() ?? ''
      if (t.length < 5 || t.length > 40) continue
      if (!isChinese(t)) continue
      parsed.push({ text: t, level: assignLevel(t.length) })
    }
    if (parsed.length > 0) {
      sentences.value = parsed
      fetched = true
    }
  } catch {
    // fallback to static sentences — already set
  } finally {
    loading.value = false
  }
}

function getRandomSentence(level: Level | null = null): Sentence {
  const pool = level ? sentences.value.filter(s => s.level === level) : sentences.value
  const src = pool.length > 0 ? pool : sentences.value
  return src[Math.floor(Math.random() * src.length)]
}

export function useSentences() {
  return { sentences, loading, fetchSentences, getRandomSentence }
}
