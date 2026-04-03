<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-center mb-2 text-indigo-300">鍵盤指法大全</h1>
    <p class="text-center text-gray-400 text-sm mb-6">注音（大千式）鍵盤配置與手指分工</p>

    <div class="bg-gray-900 rounded-2xl p-6 shadow-xl">
      <KeyboardDisplay :show-legend="true" :active-key="activeKey" />
    </div>

    <!-- pressed key info -->
    <div class="mt-3 h-8 flex items-center justify-center gap-3 text-sm">
      <template v-if="activeKey === ' '">
        <span class="font-mono text-white bg-gray-700 px-2 py-0.5 rounded">Space</span>
        <span class="text-gray-400">·</span>
        <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: FINGER_COLORS['L5'] + '33', color: FINGER_COLORS['L5'] }">
          {{ FINGER_NAMES['L5'] }}／{{ FINGER_NAMES['R5'] }}
        </span>
      </template>
      <template v-else-if="activeKeyDef">
        <span class="font-mono text-white bg-gray-700 px-2 py-0.5 rounded">{{ activeKeyDef.display }}</span>
        <span v-if="activeKeyDef.bopomofo" class="text-indigo-300 text-lg font-bold">{{ activeKeyDef.bopomofo }}</span>
        <span class="text-gray-400">·</span>
        <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: FINGER_COLORS[activeKeyDef.finger] + '33', color: FINGER_COLORS[activeKeyDef.finger] }">
          {{ FINGER_NAMES[activeKeyDef.finger] }}
        </span>
      </template>
      <span v-else class="text-gray-600 text-xs">按下任意鍵查看指法</span>
    </div>

    <div class="mt-8 grid grid-cols-2 gap-4">
      <div
        v-for="(group, hand) in fingerGroups"
        :key="hand"
        class="bg-gray-900 rounded-xl p-4"
      >
        <h2 class="text-sm font-semibold text-gray-300 mb-3">{{ hand === 'L' ? '左手' : '右手' }}</h2>
        <div v-for="item in group" :key="item.zone" class="flex items-start gap-2 mb-3">
          <span
            class="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0"
            :style="{ backgroundColor: FINGER_COLORS[item.zone] }"
          />
          <div>
            <span class="text-xs font-semibold text-gray-200">{{ FINGER_NAMES[item.zone] }}</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="k in item.keys"
                :key="k.key"
                class="text-xs bg-gray-800 px-1.5 py-0.5 rounded font-mono"
              >
                {{ k.display }}<span v-if="k.bopomofo" class="text-indigo-300 ml-0.5">{{ k.bopomofo }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 bg-indigo-950 border border-indigo-800 rounded-xl p-4 text-sm text-gray-300 space-y-1">
      <p class="font-semibold text-indigo-300 mb-2">練習要點</p>
      <p>• 雙手食指分別放在 F（ㄑ）和 J（ㄨ）鍵上作為基準位置</p>
      <p>• 打字時手腕不要移動，靠手指的延伸來敲鍵</p>
      <p>• 打完後手指要回到基準位置，不要懸空</p>
      <p>• 空白鍵用拇指按，確認注音組字</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import KeyboardDisplay from '../components/KeyboardDisplay.vue'
import { KEYBOARD_ROWS, FINGER_COLORS, FINGER_NAMES, KEY_MAP, type KeyDef } from '../data/bopomofoLayout'
import { playKeyClick } from '../composables/useKeySound'

const allKeys = KEYBOARD_ROWS.flat()
const activeKey = ref<string | null>(null)

const activeKeyDef = computed(() =>
  activeKey.value ? (KEY_MAP[activeKey.value] ?? null) : null
)

function onKeydown(e: KeyboardEvent) {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
  const k = e.key === ' ' ? ' ' : e.key.toLowerCase()
  if (k === ' ' || KEY_MAP[k]) {
    e.preventDefault()
    activeKey.value = k
    playKeyClick(k === ' ' ? 'space' : 'normal')
  }
}

function onKeyup() {
  activeKey.value = null
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('keyup', onKeyup)
})

interface FingerGroup {
  zone: string
  keys: KeyDef[]
}

const fingerGroups = computed<Record<string, FingerGroup[]>>(() => {
  const groups: Record<string, FingerGroup[]> = { L: [], R: [] }
  for (const zone of Object.keys(FINGER_NAMES)) {
    const hand = zone[0] as 'L' | 'R'
    const keys = allKeys.filter(k => k.finger === zone && k.key !== '`')
    if (keys.length) groups[hand].push({ zone, keys })
  }
  return groups
})
</script>
