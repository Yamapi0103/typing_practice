<template>
  <input
    ref="inputEl"
    :value="''"
    @beforeinput="onBeforeInput"
    @keydown="onKeydown"
    @keyup="$emit('update:activeKey', null)"
    :disabled="disabled"
    class="absolute opacity-0 w-0 h-0 pointer-events-none"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { playKeyClick } from "../composables/useKeySound";

const props = defineProps<{
  target: string;
  modelValue: string;
  disabled: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:activeKey": [key: string | null];
  "update:wrongAttempt": [value: boolean];
  error: [];
  start: [];
}>();

const inputEl = ref<HTMLInputElement | null>(null);

function onBeforeInput(e: InputEvent) {
  const expected = props.target[props.modelValue.length];

  if (e.inputType === "insertLineBreak") {
    e.preventDefault();
    if (expected === "\n") {
      emit("update:modelValue", props.modelValue + "\n");
      emit("update:wrongAttempt", false);
    } else {
      emit("update:wrongAttempt", true);
      emit("error");
    }
    return;
  }

  const char = e.data;
  if (!char || char.length !== 1) return;
  e.preventDefault();
  if (char !== expected) {
    emit("update:wrongAttempt", true);
    emit("error");
  } else {
    emit("update:wrongAttempt", false);
    emit("start");
    emit("update:modelValue", props.modelValue + char);
  }
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
  if (e.key === "Backspace") {
    e.preventDefault();
    return;
  }
  const k = codeToKey(e.code);
  if (k) {
    emit("update:activeKey", k);
    playKeyClick(k === " " ? "space" : "normal");
  }
}

defineExpose({ focus: () => inputEl.value?.focus() });
</script>
