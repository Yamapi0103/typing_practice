<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-center text-indigo-300">統計紀錄</h1>

    <div class="grid grid-cols-3 gap-4">
      <div class="bg-gray-900 rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-indigo-400">
          {{ store.records.length }}
        </div>
        <div class="text-xs text-gray-400 mt-1">練習次數</div>
      </div>
      <div class="bg-gray-900 rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-green-400">{{ store.bestWpm }}</div>
        <div class="text-xs text-gray-400 mt-1">最高 WPM</div>
      </div>
      <div class="bg-gray-900 rounded-xl p-4 text-center">
        <div class="text-3xl font-bold text-yellow-400">{{ store.avgWpm }}</div>
        <div class="text-xs text-gray-400 mt-1">平均 WPM</div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl p-4">
      <CharErrorList :chars="store.weakChars" />
    </div>

    <div class="bg-gray-900 rounded-xl p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-sm font-semibold text-gray-300">練習紀錄</h3>
        <button
          @click="confirmClear"
          class="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          清除全部
        </button>
      </div>
      <div
        v-if="store.records.length === 0"
        class="text-gray-500 text-sm text-center py-4"
      >
        尚無練習紀錄，快去打字吧！
      </div>
      <div v-else class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="(r, i) in store.records"
          :key="i"
          class="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 text-sm"
        >
          <span class="text-gray-400 text-xs w-28 flex-shrink-0">{{
            formatDate(r.date)
          }}</span>
          <span class="text-indigo-300 font-bold w-16 text-right"
            >{{ r.wpm }} WPM</span
          >
          <span
            class="w-16 text-right"
            :class="
              r.accuracy >= 95
                ? 'text-green-400'
                : r.accuracy >= 80
                  ? 'text-yellow-400'
                  : 'text-red-400'
            "
          >
            {{ r.accuracy }}%
          </span>
          <span class="text-gray-500 w-12 text-right">{{ r.charCount }}字</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CharErrorList from "../components/CharErrorList.vue";
import { useHistoryStore } from "../stores/historyStore";

const store = useHistoryStore();

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function confirmClear() {
  if (confirm("確定要清除所有紀錄嗎？")) store.clearAll();
}
</script>
