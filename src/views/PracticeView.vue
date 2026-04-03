<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-center text-indigo-300">注音打字練習</h1>

    <div class="flex gap-2 justify-center">
      <button
        v-for="lv in ([1, 2, 3] as const)"
        :key="lv"
        @click="selectLevel(lv)"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          level === lv
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
        ]"
      >
        {{ (['初級', '中級', '高級'] as const)[lv - 1] }}
      </button>
      <button
        @click="selectLevel(null)"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          level === null
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
        ]"
      >全部</button>
    </div>

    <div class="bg-gray-900 rounded-2xl p-6 shadow-xl min-h-[5rem] flex items-center justify-center flex-wrap gap-1">
      <span
        v-for="(char, i) in currentChars"
        :key="i"
        class="text-2xl font-bold px-0.5 rounded transition-all"
        :class="charClass(i)"
      >{{ char }}</span>
    </div>

    <div class="relative">
      <input
        ref="inputEl"
        v-model="inputValue"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @input="onInput"
        @keydown="onKeydown"
        @keyup="onKeyup"
        :disabled="finished"
        placeholder="點此開始輸入（使用注音輸入法）"
        class="w-full bg-gray-800 border-2 rounded-xl px-4 py-3 text-lg outline-none transition-colors"
        :class="finished ? 'border-green-600 text-green-400' : 'border-indigo-700 focus:border-indigo-400 text-white'"
      />
      <span v-if="composing" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-indigo-400 opacity-70">
        輸入中…
      </span>
    </div>

    <div class="flex justify-center">
      <StatsPanel :wpm="wpm" :accuracy="accuracy" :typed="typedCount" />
    </div>

    <div class="bg-gray-900 rounded-2xl p-4 overflow-x-auto">
      <p class="text-xs text-gray-500 text-center mb-3">鍵盤指法提示</p>
      <KeyboardDisplay :compact="false" :show-legend="false" :active-key="activeKey" />
    </div>

    <div v-if="finished" class="bg-green-900/40 border border-green-700 rounded-xl p-4 text-center space-y-2">
      <p class="text-green-300 font-semibold text-lg">完成！</p>
      <p class="text-sm text-gray-300">
        速度 <strong class="text-indigo-300">{{ wpm }}</strong> 字/分 ·
        正確率 <strong :class="accuracy >= 95 ? 'text-green-300' : 'text-yellow-300'">{{ accuracy }}%</strong>
      </p>
      <button
        @click="nextSentence"
        class="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-medium transition-colors"
      >
        下一句
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import StatsPanel from '../components/StatsPanel.vue'
import KeyboardDisplay from '../components/KeyboardDisplay.vue'
import { getRandomSentence, type Sentence } from '../data/sentences'
import { useHistoryStore } from '../stores/historyStore'
import type { CharStat } from '../stores/historyStore'
import { playKeyClick } from '../composables/useKeySound'

const historyStore = useHistoryStore()

type Level = 1 | 2 | 3

const level = ref<Level | null>(1)
const sentence = ref<Sentence>(getRandomSentence(1))
const inputValue = ref('')
const composing = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

const startTime = ref<number | null>(null)
const finishTime = ref<number | null>(null)
const finished = ref(false)

const charErrors = ref<Record<string, CharStat>>({})
const typedCount = ref(0)
const errorCount = ref(0)
const activeKey = ref<string | null>(null)

const currentChars = computed(() => [...sentence.value.text])

function charClass(i: number) {
  const done = typedCount.value
  if (i < done) {
    const char = currentChars.value[i]
    const stat = charErrors.value[char]
    return stat && stat.errors > 0 ? 'text-red-400' : 'text-green-400'
  }
  if (i === done) return 'bg-indigo-700/50 text-white'
  return 'text-gray-500'
}

function onCompositionStart() {
  composing.value = true
  if (!startTime.value) startTime.value = Date.now()
}

function onCompositionEnd() {
  composing.value = false
  nextTick(() => processInput())
}

function onInput() {
  if (composing.value) return
  processInput()
}

// e.key returns 'Process' during IME composition — use e.code for physical key
function codeToKey(code: string): string | null {
  if (code === 'Space') return ' '
  if (code.startsWith('Key')) return code.slice(3).toLowerCase()
  if (code.startsWith('Digit')) return code.slice(5)
  const map: Record<string, string> = {
    Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
    Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/',
    Backquote: '`',
  }
  return map[code] ?? null
}

function onKeydown(e: KeyboardEvent) {
  if (finished.value) return

  // Use e.code so it works even during IME composition (e.key === 'Process')
  const k = codeToKey(e.code)
  if (k) {
    activeKey.value = k
    playKeyClick(k === ' ' ? 'space' : 'normal')
  }

  if (e.key === 'Backspace' && !composing.value) {
    if (typedCount.value > 0) {
      typedCount.value--
      inputValue.value = inputValue.value.slice(0, -1)
      e.preventDefault()
    }
  }
}

function onKeyup() {
  activeKey.value = null
}

function processInput() {
  const target = sentence.value.text
  const raw = inputValue.value

  for (let i = 0; i < raw.length && i < target.length; i++) {
    const char = target[i]
    if (!charErrors.value[char]) charErrors.value[char] = { total: 0, errors: 0 }
    charErrors.value[char].total++
    if (raw[i] !== char) {
      charErrors.value[char].errors++
      errorCount.value++
    }
  }
  typedCount.value = Math.min(raw.length, target.length)

  if (raw.length >= target.length) {
    finishTime.value = Date.now()
    finished.value = true
    saveRecord()
  }
}

const wpm = computed(() => {
  if (!startTime.value) return 0
  const elapsed = ((finishTime.value ?? Date.now()) - startTime.value) / 1000 / 60
  if (elapsed <= 0) return 0
  return Math.round(typedCount.value / elapsed)
})

const accuracy = computed(() => {
  if (typedCount.value === 0) return 100
  return Math.round(((typedCount.value - errorCount.value) / typedCount.value) * 100)
})

function saveRecord() {
  const duration = (finishTime.value! - startTime.value!) / 1000
  historyStore.addRecord({
    wpm: wpm.value,
    accuracy: accuracy.value,
    charCount: typedCount.value,
    duration,
    charErrors: charErrors.value,
  })
}

function selectLevel(lv: Level | null) {
  level.value = lv
  resetPractice(lv)
}

function nextSentence() {
  resetPractice(level.value)
}

function resetPractice(lv: Level | null) {
  sentence.value = getRandomSentence(lv)
  inputValue.value = ''
  typedCount.value = 0
  errorCount.value = 0
  charErrors.value = {}
  startTime.value = null
  finishTime.value = null
  finished.value = false
  composing.value = false
  activeKey.value = null
  nextTick(() => inputEl.value?.focus())
}
</script>
