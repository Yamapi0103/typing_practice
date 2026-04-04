<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-center text-indigo-300">打字練習</h1>

    <!-- Language toggle -->
    <div class="flex gap-2 justify-center">
      <button
        @click="selectLang('zh')"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          lang === 'zh' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
        ]"
      >中文</button>
      <button
        @click="selectLang('en')"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
          lang === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
        ]"
      >English</button>
    </div>

    <!-- Level buttons -->
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

    <p v-if="sentencesLoading" class="text-xs text-indigo-400 text-center animate-pulse">正在載入最新題目…</p>

    <div class="bg-gray-900 rounded-2xl p-6 shadow-xl min-h-[5rem] flex items-center justify-center">
      <p class="text-center text-2xl font-bold leading-relaxed">
        <span
          v-for="(char, i) in currentChars"
          :key="i"
          class="rounded transition-all"
          :class="charClass(i)"
        >{{ char }}</span>
      </p>
    </div>

    <div class="flex gap-2 items-center">
      <div class="relative flex-1">
        <input
          ref="inputEl"
          v-model="inputValue"
          @compositionstart="onCompositionStart"
          @compositionend="onCompositionEnd"
          @input="onInput"
          @keydown="onKeydown"
          @keyup="onKeyup"
          :disabled="finished"
          :placeholder="lang === 'zh' ? '點此開始輸入（使用注音輸入法）' : 'Click here to start typing'"
          class="w-full bg-gray-800 border-2 rounded-xl px-4 py-3 text-lg outline-none transition-colors"
          :class="finished ? 'border-green-600 text-green-400' : 'border-indigo-700 focus:border-indigo-400 text-white'"
        />
        <span v-if="composing" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-indigo-400 opacity-70">
          輸入中…
        </span>
      </div>
      <button
        v-if="!finished"
        @click="nextSentence"
        class="px-4 py-3 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors whitespace-nowrap"
      >跳過</button>
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
      <p class="text-xs text-gray-500 mt-1">或按 Enter 繼續</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import StatsPanel from '../components/StatsPanel.vue'
import KeyboardDisplay from '../components/KeyboardDisplay.vue'
import { useSentences, type Lang } from '../composables/useSentences'
import type { Sentence } from '../data/sentences'
import { useHistoryStore } from '../stores/historyStore'
import type { CharStat } from '../stores/historyStore'
import { playKeyClick } from '../composables/useKeySound'

const historyStore = useHistoryStore()
const { lang, loading: sentencesLoading, fetchZh, fetchEn, switchLang, getRandomSentence } = useSentences()

type Level = 1 | 2 | 3

const level = ref<Level | null>(1)
const sentence = ref<Sentence>(getRandomSentence(1))
const inputValue = ref('')
const composing = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

const startTime = ref<number | null>(null)
const finishTime = ref<number | null>(null)
const finished = ref(false)

const activeKey = ref<string | null>(null)

const currentChars = computed(() => [...sentence.value.text])

const typedCount = computed(() =>
  Math.min(inputValue.value.length, sentence.value.text.length)
)

const accuracy = computed(() => {
  const raw = inputValue.value
  const target = sentence.value.text
  const len = Math.min(raw.length, target.length)
  if (len === 0) return 100
  let correct = 0
  for (let i = 0; i < len; i++) if (raw[i] === target[i]) correct++
  return Math.round((correct / len) * 100)
})

function charClass(i: number) {
  const raw = inputValue.value
  const target = sentence.value.text
  if (i < raw.length) return raw[i] === target[i] ? 'text-green-400' : 'text-red-400'
  if (i === raw.length) return 'bg-indigo-700/50 text-white'
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
  if (!startTime.value) startTime.value = Date.now()
  if (composing.value) return
  processInput()
}

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
  const k = codeToKey(e.code)
  if (k) {
    activeKey.value = k
    playKeyClick(k === ' ' ? 'space' : 'normal')
  }
}

function onKeyup() {
  activeKey.value = null
}

function processInput() {
  const target = sentence.value.text
  const raw = inputValue.value
  if (raw === target) {
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

function saveRecord() {
  const target = sentence.value.text
  const raw = inputValue.value
  const charErrors: Record<string, CharStat> = {}
  for (let i = 0; i < target.length; i++) {
    const char = target[i]
    if (!charErrors[char]) charErrors[char] = { total: 0, errors: 0 }
    charErrors[char].total++
    if (raw[i] !== char) charErrors[char].errors++
  }
  const duration = (finishTime.value! - startTime.value!) / 1000
  historyStore.addRecord({
    wpm: wpm.value,
    accuracy: accuracy.value,
    charCount: typedCount.value,
    duration,
    charErrors,
  })
}

function selectLang(l: Lang) {
  switchLang(l)
  resetPractice(level.value)
  if (l === 'en') fetchEn()
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
  startTime.value = null
  finishTime.value = null
  finished.value = false
  composing.value = false
  activeKey.value = null
  nextTick(() => inputEl.value?.focus())
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (finished.value && e.code === 'Enter') {
    e.preventDefault()
    nextSentence()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
  const init = lang.value === 'en'
    ? fetchEn()
    : fetchZh()
  init.then(() => {
    if (!startTime.value) sentence.value = getRandomSentence(level.value)
  })
})
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown))
</script>
