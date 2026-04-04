# ⌨ 注音打字練習

A typing practice app for Bopomofo (Zhuyin) input method, built with Vue 3 + TypeScript.

**[Live Demo](https://typing-practice-roan.vercel.app)**

## Features

- **指法大全** — Interactive keyboard layout showing Bopomofo (Daqian standard) key mappings and finger assignments. Press any key to highlight its position and finger.
- **打字練習** — Typing practice in Chinese (Bopomofo) and English, with 3 difficulty levels. Real-time feedback with color-coded correct/incorrect characters.
- **統計紀錄** — Persistent stats tracking WPM, accuracy, and practice history.

## Tech Stack

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/) (with persisted state)
- [Vue Router](https://router.vuejs.org/)

## Development

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
```
