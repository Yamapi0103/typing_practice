<template>
  <div class="min-h-screen flex flex-col">
    <nav class="bg-gray-900 border-b border-gray-800 px-6 py-3 flex gap-6 items-center">
      <span class="text-lg font-bold text-indigo-400 mr-4">⌨ 注音打字</span>
      <router-link
        to="/"
        class="text-gray-300 hover:text-white transition-colors"
        active-class="text-indigo-400 font-semibold"
        exact-active-class="text-indigo-400 font-semibold"
      >
        指法大全
      </router-link>
      <router-link
        to="/practice"
        class="text-gray-300 hover:text-white transition-colors"
        active-class="text-indigo-400 font-semibold"
      >
        打字練習
      </router-link>
      <router-link
        to="/stats"
        class="text-gray-300 hover:text-white transition-colors"
        active-class="text-indigo-400 font-semibold"
      >
        統計紀錄
      </router-link>
    </nav>
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>
