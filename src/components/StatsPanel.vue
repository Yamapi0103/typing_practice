<template>
  <div class="flex gap-6">
    <div class="text-center">
      <div class="text-3xl font-bold text-indigo-400">{{ wpm }}</div>
      <div class="text-xs text-gray-400 mt-1">字/分鐘</div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold" :class="accuracyColor">{{ accuracy }}%</div>
      <div class="text-xs text-gray-400 mt-1">正確率</div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold text-gray-300">{{ typed }}</div>
      <div class="text-xs text-gray-400 mt-1">已打字數</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  wpm: number
  accuracy: number
  typed: number
}>()

const accuracyColor = computed(() => {
  if (props.accuracy >= 95) return 'text-green-400'
  if (props.accuracy >= 80) return 'text-yellow-400'
  return 'text-red-400'
})
</script>
