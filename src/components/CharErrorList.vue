<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-400 mb-2">最常出錯的字</h3>
    <div v-if="chars.length === 0" class="text-gray-500 text-sm">尚無資料</div>
    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="item in chars"
        :key="item.char"
        class="flex flex-col items-center bg-gray-800 rounded p-2 min-w-[3rem]"
      >
        <span
          class="text-xl font-bold"
          :style="{ color: errorColor(item.errorRate) }"
        >
          {{ item.char }}
        </span>
        <span class="text-xs text-gray-400 mt-1"
          >{{ Math.round(item.errorRate * 100) }}%</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeakChar } from "../stores/historyStore";

defineProps<{
  chars: WeakChar[];
}>();

function errorColor(rate: number): string {
  if (rate >= 0.6) return "#ef4444";
  if (rate >= 0.3) return "#f97316";
  return "#eab308";
}
</script>
