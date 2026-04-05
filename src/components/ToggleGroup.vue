<template>
  <div class="flex gap-2 justify-center">
    <button
      v-for="option in options"
      :key="String(option.value)"
      @click="$emit('update:modelValue', option.value)"
      :class="[
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
        modelValue === option.value
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
      ]"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T">
defineProps<{
  options: { value: T; label: string }[];
  modelValue: T;
}>();
defineEmits<{ "update:modelValue": [value: T] }>();
</script>
