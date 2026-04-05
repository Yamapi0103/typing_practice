# ⌨ 打字練習

身為一個工程師，打字速度是非常重要的

**[Demo Page](https://typing-practice-roan.vercel.app)**

## Features

- **指法大全** — Interactive keyboard layout showing Bopomofo (Daqian standard) key mappings and finger assignments. Press any key to highlight its position and finger.
- **打字練習** — Typing practice in Chinese (Bopomofo) and English, with 3 difficulty levels. Real-time feedback with color-coded correct/incorrect characters.
  - 中文：從[教育部](https://www.edu.tw) 新聞 RSS 抓取即時新聞標題作為練習句
  - English：從 [type.fit](https://type.fit) 抓取英文句子，依難度分級
- **統計紀錄** — Persistent stats tracking WPM, accuracy, and practice history.

## Login

- Sign in with **Google account** — typing history is saved to the cloud and accessible across devices
- Powered by [Supabase](https://supabase.com) Auth + PostgreSQL

## Tech Stack

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)
- [Supabase](https://supabase.com) (Auth + Database)
- [Vue Router](https://router.vuejs.org/)

## Development

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
```
