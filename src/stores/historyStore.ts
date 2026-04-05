import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface PracticeRecord {
  date: string
  wpm: number
  accuracy: number
  charCount: number
  duration: number
}

export interface CharStat {
  total: number
  errors: number
}

export interface WeakChar {
  char: string
  errorRate: number
  errors: number
  total: number
}

export const useHistoryStore = defineStore('history', () => {
  const records = ref<PracticeRecord[]>([])
  const charStats = ref<Record<string, CharStat>>({})

  function addRecord({
    wpm,
    accuracy,
    charCount,
    duration,
    charErrors,
  }: {
    wpm: number
    accuracy: number
    charCount: number
    duration: number
    charErrors: Record<string, CharStat>
  }) {
    records.value.unshift({ date: new Date().toISOString(), wpm, accuracy, charCount, duration })
    if (records.value.length > 100) records.value.splice(100)

    for (const [char, { total, errors }] of Object.entries(charErrors)) {
      if (!charStats.value[char]) charStats.value[char] = { total: 0, errors: 0 }
      charStats.value[char].total += total
      charStats.value[char].errors += errors
    }
  }

  const weakChars = computed<WeakChar[]>(() =>
    Object.entries(charStats.value)
      .filter(([, v]) => v.total >= 2)
      .map(([char, v]) => ({
        char,
        errorRate: v.errors / v.total,
        errors: v.errors,
        total: v.total,
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 20)
  )

  const bestWpm = computed(() =>
    records.value.length ? Math.max(...records.value.map(r => r.wpm)) : 0
  )

  const avgWpm = computed(() =>
    records.value.length
      ? Math.round(records.value.reduce((s, r) => s + r.wpm, 0) / records.value.length)
      : 0
  )

  function clearAll() {
    records.value = []
    charStats.value = {}
  }

  return { records, charStats, weakChars, bestWpm, avgWpm, addRecord, clearAll }
})
