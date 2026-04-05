<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-center text-indigo-300">打字練習</h1>

    <!-- Language toggle -->
    <ToggleGroup
      :options="langOptions"
      :model-value="lang"
      @update:model-value="selectLang"
    />

    <!-- Level buttons -->
    <ToggleGroup
      :options="levelOptions"
      :model-value="level"
      @update:model-value="selectLevel"
    />

    <p
      v-if="sentencesLoading"
      class="text-xs text-indigo-400 text-center animate-pulse"
    >
      正在載入最新題目…
    </p>

    <div
      @click="lang === 'en' && typingInput?.focus()"
      class="bg-gray-900 rounded-2xl p-6 shadow-xl min-h-[5rem] flex items-center justify-center cursor-text"
    >
      <p class="text-center text-2xl font-bold leading-relaxed">
        <template v-for="(char, i) in currentChars" :key="i">
          <span class="rounded transition-all" :class="charClasses[i]">{{
            char === "\n" ? "↵" : char
          }}</span
          ><br v-if="char === '\n'" />
        </template>
      </p>
    </div>

    <p
      v-if="lang === 'en' && imeDetected"
      class="text-sm text-yellow-400 bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-2 text-center"
    >
      ⚠️ 偵測到中文輸入法，請切換為英文輸入法
    </p>

    <EnglishInput
      v-if="lang === 'en'"
      ref="typingInput"
      :target="sentence.text"
      :disabled="finished"
      :model-value="inputValue"
      @update:model-value="onInputValue"
      @update:active-key="activeKey = $event"
      @update:wrong-attempt="wrongAttempt = $event"
      @update:ime-detected="imeDetected = $event"
      @error="
        errorCount++;
        errorKeys.push($event);
      "
      @start="onStart"
    />

    <ChineseInput
      v-else
      ref="typingInput"
      :disabled="finished"
      :model-value="inputValue"
      @update:model-value="onInputValue"
      @update:active-key="activeKey = $event"
      @update:composing="composing = $event"
      @update:composing-start-len="composingStartLen = $event"
      @start="onStart"
    >
      <button
        v-if="!finished"
        @click="nextSentence"
        class="px-4 py-3 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors whitespace-nowrap"
      >
        跳過
      </button>
    </ChineseInput>

    <div class="flex justify-center">
      <StatsPanel
        :wpm="wpm"
        :accuracy="accuracy"
        :typed="typedCount"
        :errors="errorCount"
        :lang="lang"
      />
    </div>

    <div
      v-if="finished"
      class="bg-green-900/40 border border-green-700 rounded-xl p-4 text-center space-y-2"
    >
      <p class="text-green-300 font-semibold text-lg">完成！</p>
      <p class="text-sm text-gray-300">
        速度 <strong class="text-indigo-300">{{ wpm }}</strong> 字/分 · 正確率
        <strong :class="accuracy >= 95 ? 'text-green-300' : 'text-yellow-300'"
          >{{ accuracy }}%</strong
        >
      </p>
      <div class="flex gap-2 justify-center mt-2">
        <button
          @click="nextSentence"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-medium transition-colors"
        >
          下一句
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-1">或按 Enter 繼續</p>
    </div>

    <div class="bg-gray-900 rounded-2xl p-4 overflow-x-auto">
      <p class="text-xs text-gray-500 text-center mb-3">鍵盤指法提示</p>
      <KeyboardDisplay
        :compact="false"
        :show-legend="false"
        :active-key="activeKey"
        :error-keys="finished ? errorKeys : []"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";
import StatsPanel from "../components/StatsPanel.vue";
import KeyboardDisplay from "../components/KeyboardDisplay.vue";
import ToggleGroup from "../components/ToggleGroup.vue";
import EnglishInput from "../components/EnglishInput.vue";
import ChineseInput from "../components/ChineseInput.vue";
import { useSentences, type Lang } from "../composables/useSentences";
import type { Sentence } from "../data/sentences";
import { useHistoryStore } from "../stores/historyStore";
import type { CharStat } from "../stores/historyStore";
import { useAuth } from "../composables/useAuth";
import { supabase } from "../lib/supabase";

const historyStore = useHistoryStore();
const { user } = useAuth();
const {
  lang,
  loading: sentencesLoading,
  fetchZh,
  fetchEn,
  switchLang,
  getRandomSentence,
} = useSentences();

type Level = 1 | 2 | 3;

const langOptions = [
  { value: "zh" as Lang, label: "中文" },
  { value: "en" as Lang, label: "English" },
];

const levelOptions = [
  { value: 1 as Level, label: "初級" },
  { value: 2 as Level, label: "中級" },
  { value: 3 as Level, label: "高級" },
  { value: null as Level | null, label: "全部" },
];

const level = ref<Level | null>(1);
const sentence = ref<Sentence>(getRandomSentence(1));
const inputValue = ref("");
const composing = ref(false);
const composingStartLen = ref(0);
const typingInput = ref<{ focus: () => void } | null>(null);

const startTime = ref<number | null>(null);
const finishTime = ref<number | null>(null);
const finished = ref(false);

const activeKey = ref<string | null>(null);
const wrongAttempt = ref(false);
const errorCount = ref(0);
const errorKeys = ref<string[]>([]);
const imeDetected = ref(false);

const currentChars = computed(() => [...sentence.value.text]);

const typedCount = computed(() =>
  Math.min(inputValue.value.length, sentence.value.text.length),
);

const accuracy = computed(() => {
  if (lang.value === "en") {
    const total = typedCount.value + errorCount.value;
    if (total === 0) return 100;
    return Math.round((typedCount.value / total) * 100);
  }
  const raw = inputValue.value;
  const target = sentence.value.text;
  const len = Math.min(raw.length, target.length);
  if (len === 0) return 100;
  let correct = 0;
  for (let i = 0; i < len; i++) if (raw[i] === target[i]) correct++;
  return Math.round((correct / len) * 100);
});

const charClasses = computed(() => {
  const raw = inputValue.value;
  const target = sentence.value.text;
  const colorUpTo = composing.value ? composingStartLen.value : raw.length;
  return currentChars.value.map((_, i) => {
    if (i < colorUpTo)
      return raw[i] === target[i] ? "text-green-400" : "text-red-400";
    if (i === raw.length && !composing.value)
      return wrongAttempt.value
        ? "bg-red-500/30 text-red-500"
        : "bg-indigo-700/50 text-white";
    return "text-gray-500";
  });
});

watch(finished, val => {
  if (val) nextTick(() => (document.activeElement as HTMLElement)?.blur());
});

function onStart() {
  if (!startTime.value) startTime.value = Date.now();
}

function onInputValue(val: string) {
  inputValue.value = val;
  if (!composing.value && val === sentence.value.text) {
    finishTime.value = Date.now();
    finished.value = true;
    saveRecord();
  }
}

const wpm = computed(() => {
  if (!startTime.value) return 0;
  const elapsed =
    ((finishTime.value ?? Date.now()) - startTime.value) / 1000 / 60;
  if (elapsed <= 0) return 0;
  const count = lang.value === "en" ? typedCount.value / 5 : typedCount.value;
  return Math.round(count / elapsed);
});

function saveRecord() {
  const target = sentence.value.text;
  const raw = inputValue.value;
  const charErrors: Record<string, CharStat> = {};
  for (let i = 0; i < target.length; i++) {
    const char = target[i];
    if (!charErrors[char]) charErrors[char] = { total: 0, errors: 0 };
    charErrors[char].total++;
    if (raw[i] !== char) charErrors[char].errors++;
  }
  const duration = (finishTime.value! - startTime.value!) / 1000;
  historyStore.addRecord({
    wpm: wpm.value,
    accuracy: accuracy.value,
    charCount: typedCount.value,
    duration,
    charErrors,
  });

  if (user.value) {
    supabase.from("typing_records").insert({
      user_id: user.value.id,
      lang: lang.value,
      sentence: target,
      wpm: wpm.value,
      accuracy: accuracy.value,
    }).then(({ error }) => {
      if (error) console.error("insert error:", error);
      else console.log("record saved");
    });
  }
}

function selectLang(l: Lang) {
  switchLang(l);
  resetPractice(level.value);
}

function selectLevel(lv: Level | null) {
  level.value = lv;
  resetPractice(lv);
}

function nextSentence() {
  resetPractice(level.value);
}

function resetPractice(lv: Level | null) {
  sentence.value = getRandomSentence(lv);
  inputValue.value = "";
  startTime.value = null;
  finishTime.value = null;
  finished.value = false;
  composing.value = false;
  activeKey.value = null;
  wrongAttempt.value = false;
  errorCount.value = 0;
  errorKeys.value = [];
  imeDetected.value = false;
  nextTick(() => typingInput.value?.focus());
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (finished.value && e.code === "Enter") {
    e.preventDefault();
    nextSentence();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onGlobalKeydown);
  const init = lang.value === "en" ? fetchEn() : fetchZh();
  init.then(() => {
    if (!startTime.value) sentence.value = getRandomSentence(level.value);
    nextTick(() => typingInput.value?.focus());
  });
});
onUnmounted(() => window.removeEventListener("keydown", onGlobalKeydown));
</script>
