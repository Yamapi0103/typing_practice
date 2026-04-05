<template>
  <div class="select-none">
    <div
      v-for="(row, ri) in KEYBOARD_ROWS"
      :key="ri"
      class="flex gap-1 mb-1 justify-center"
    >
      <div v-if="ri === 1" class="w-20" />
      <div v-if="ri === 2" class="w-20" />
      <div v-if="ri === 3" class="w-24" />

      <div
        v-for="keyDef in row"
        :key="keyDef.key"
        :style="
          keyStyle(
            keyDef,
            pressedKey === keyDef.key || activeKey === keyDef.key,
          )
        "
        class="relative flex flex-col items-center justify-center rounded border text-xs font-mono cursor-pointer"
        :class="[
          compact ? 'w-9 h-9' : 'w-12 h-12',
          pressedKey === keyDef.key || activeKey === keyDef.key
            ? 'pressed'
            : 'opacity-90',
        ]"
        @mousedown="handlePress(keyDef.key)"
        @touchstart.prevent="handlePress(keyDef.key)"
      >
        <span class="text-[10px] leading-none font-bold opacity-60">{{
          keyDef.display
        }}</span>
        <span v-if="keyDef.bopomofo" class="text-sm leading-none mt-0.5">{{
          keyDef.bopomofo
        }}</span>

        <!-- ripple -->
        <span
          v-if="rippleKey === keyDef.key"
          class="absolute inset-0 rounded animate-ripple pointer-events-none"
          :style="{ backgroundColor: FINGER_COLORS[keyDef.finger] + '55' }"
        />
      </div>
    </div>

    <!-- Space bar -->
    <div class="flex justify-center mt-1">
      <div
        class="rounded border border-gray-600 flex items-center justify-center text-xs cursor-pointer relative overflow-hidden"
        :class="[
          compact ? 'w-48 h-9' : 'w-64 h-12',
          pressedKey === ' ' || activeKey === ' ' ? 'pressed' : 'opacity-70',
        ]"
        :style="{
          backgroundColor:
            FINGER_COLORS['L5'] +
            (pressedKey === ' ' || activeKey === ' ' ? 'cc' : '33'),
          borderColor: FINGER_COLORS['L5'] + '88',
          color: '#fff',
        }"
        @mousedown="handlePress(' ')"
        @touchstart.prevent="handlePress(' ')"
      >
        空白鍵（拇指）
        <span
          v-if="rippleKey === ' '"
          class="absolute inset-0 animate-ripple pointer-events-none"
          :style="{ backgroundColor: FINGER_COLORS['L5'] + '55' }"
        />
      </div>
    </div>

    <div v-if="showLegend" class="flex flex-wrap gap-2 mt-4 justify-center">
      <div
        v-for="(name, zone) in FINGER_NAMES"
        :key="zone"
        class="flex items-center gap-1 text-xs"
      >
        <span
          class="w-3 h-3 rounded-sm inline-block"
          :style="{ backgroundColor: FINGER_COLORS[zone] }"
        />
        <span class="text-gray-300">{{ name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  KEYBOARD_ROWS,
  FINGER_COLORS,
  FINGER_NAMES,
  type KeyDef,
} from "../data/bopomofoLayout";
import { playKeyClick } from "../composables/useKeySound";

const props = withDefaults(
  defineProps<{
    activeKey?: string | null;
    showLegend?: boolean;
    compact?: boolean;
  }>(),
  {
    activeKey: null,
    showLegend: true,
    compact: false,
  },
);

const emit = defineEmits<{
  keypress: [key: string];
}>();

const pressedKey = ref<string | null>(null);
const rippleKey = ref<string | null>(null);

// Trigger ripple when activeKey changes (e.g. physical keypress from parent)
watch(
  () => props.activeKey,
  (key) => {
    if (!key) return;
    rippleKey.value = key;
    setTimeout(() => {
      rippleKey.value = null;
    }, 400);
  },
);

function handlePress(key: string) {
  playKeyClick(key === " " ? "space" : "normal");

  pressedKey.value = key;
  rippleKey.value = key;

  setTimeout(() => {
    pressedKey.value = null;
  }, 120);
  setTimeout(() => {
    rippleKey.value = null;
  }, 400);

  emit("keypress", key);
}

function keyStyle(keyDef: KeyDef, pressed: boolean) {
  const color = FINGER_COLORS[keyDef.finger] ?? "#374151";
  return {
    backgroundColor: pressed ? color + "99" : color + "33",
    borderColor: color + "88",
    color: "#fff",
    transform: pressed ? "translateY(2px) scale(0.93)" : "",
    boxShadow: pressed ? `0 1px 0 ${color}44` : `0 3px 0 ${color}44`,
    transition:
      "transform 0.08s ease, box-shadow 0.08s ease, background-color 0.08s ease",
  };
}
</script>

<style scoped>
@keyframes ripple {
  from {
    opacity: 0.7;
    transform: scale(0.5);
  }
  to {
    opacity: 0;
    transform: scale(2.2);
  }
}
.animate-ripple {
  animation: ripple 0.35s ease-out forwards;
}
</style>
