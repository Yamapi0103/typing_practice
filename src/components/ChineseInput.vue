<template>
  <div class="flex gap-2 items-center">
    <div class="relative flex-1">
      <input
        ref="inputEl"
        :value="modelValue"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @input="onInput"
        @keydown="onKeydown"
        @keyup="$emit('update:activeKey', null)"
        :disabled="disabled"
        placeholder="點此開始輸入（使用注音輸入法）"
        class="w-full bg-gray-800 border-2 rounded-xl px-4 py-3 text-lg outline-none transition-colors"
        :class="
          disabled
            ? 'border-green-600 text-green-400'
            : 'border-indigo-700 focus:border-indigo-400 text-white'
        "
      />
      <span
        v-if="composing"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-indigo-400 opacity-70"
      >
        輸入中…
      </span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { playKeyClick } from "../composables/useKeySound";

const props = defineProps<{
  modelValue: string;
  disabled: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:activeKey": [key: string | null];
  "update:composing": [value: boolean];
  "update:composingStartLen": [value: number];
  start: [];
}>();

const inputEl = ref<HTMLInputElement | null>(null);
const composing = ref(false);

function onCompositionStart() {
  composing.value = true;
  emit("update:composing", true);
  emit("update:composingStartLen", props.modelValue.length);
  emit("start");
}

function onCompositionEnd(e: Event) {
  // 先更新 composing 狀態
  composing.value = false;
  emit("update:composing", false);
  // 然後重新觸發 modelValue 更新，此時 composing 已經是 false，父元件可以正確驗證
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}

function onInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
  emit("start");
}

function codeToKey(code: string): string | null {
  if (code === "Space") return " ";
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit")) return code.slice(5);
  const map: Record<string, string> = {
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Backquote: "`",
  };
  return map[code] ?? null;
}

function onKeydown(e: KeyboardEvent) {
  const k = codeToKey(e.code);
  if (k) {
    emit("update:activeKey", k);
    playKeyClick(k === " " ? "space" : "normal");
  }
}

defineExpose({ focus: () => inputEl.value?.focus() });
</script>
