# ⌨ 打字練習

身為一個工程師，打字速度是非常重要的

**[Demo Page](https://typing-practice-roan.vercel.app)**

## 功能特色

- **指法大全** — 互動式鍵盤配置，顯示注音（大千標準）鍵位對應及手指分配。按下任意按鍵即可突顯其位置和對應手指。
- **打字練習** — 中文（注音）及英文打字練習，共 3 個難度等級。即時反饋並以顏色區分正確/錯誤字元。
  - 中文：從[教育部](https://www.edu.tw)新聞 RSS 抓取即時新聞標題作為練習句
  - 英文：從 [type.fit](https://type.fit) 抓取英文句子，依難度分級
- **統計紀錄** — 持續追蹤 WPM、準確度及練習歷史紀錄。

## 登入

- 可使用 **Google 帳號** or **自行創建帳密** 登入 — 打字歷史會同步到雲端，跨裝置可存取
- 由 [Supabase](https://supabase.com) Auth + PostgreSQL 提供

## 技術棧

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)
- [Supabase](https://supabase.com)（驗証 + 資料庫）
- [Vue Router](https://router.vuejs.org/)

## 開發

```bash
pnpm install
pnpm dev
pnpm build
```

## 架構：外部 API 請求處理

本專案根據執行環境採用不同的策略來抓取外部 API，以避免 CORS（跨網域資源共享）問題。

### 環境對比

| 項目 | 本地開發 | 生產環境 (Vercel) |
|------|--------|-----------------|
| **中文新聞** | Vite 代理 `/rss` | Vercel Edge Function `/api/rss` |
| **英文句子** | Vite 代理 `/typefit` | Vercel Edge Function `/api/data` |
| **實際目標** | `https://www.edu.tw/...` | `https://www.edu.tw/...` |
| **實際目標** | `https://type.fit/...` | `https://type.fit/...` |

### 本地開發（Vite 代理）

執行 `pnpm dev` 時，Vite 開發伺服器會代理 API 請求：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/rss': {
      target: 'https://www.edu.tw',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/rss/, ''),
    },
    '/typefit': {
      target: 'https://type.fit',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/typefit/, ''),
    },
  }
}
```

**請求流程：**
```
瀏覽器 → http://localhost:5173/rss/...
      ↓
Vite 代理攔截請求
      ↓
轉發到 https://www.edu.tw/...
      ↓
回傳回應給瀏覽器
```

### 生產環境（Vercel Serverless）

在生產環境中，請求透過 Vercel Edge Function 路由以避免 CORS 限制：

**請求流程：**
```
瀏覽器 → https://typing-practice-roan.vercel.app/api/rss
      ↓
Vercel Edge Function (api/rss.ts) 執行
      ↓
內部轉發到 https://www.edu.tw/...
      ↓
回傳回應給瀏覽器
```

### 為何採用兩種方案？

1. **CORS 保護** — 外部 API 會阻止來自不同源的直接瀏覽器請求
2. **透明切換** — 程式碼使用環境變數根據環境自動選擇正確的端點
3. **開發便利性** — Vite 代理無縫處理跨域問題，無需在開發期間建立獨立的後端基礎設施

### 設定

程式碼透過環境變數自動選擇正確的端點：

```typescript
// src/composables/useSentences.ts
const RSS_PATH = import.meta.env.VITE_RSS_API ?? "/rss/Rss_News.aspx?n=9E7AC85F1954DDA8";
const EN_API = import.meta.env.VITE_DATA_API ?? "/typefit/data/typing-texts.json";
```

**環境變數：**
- **本地**：未設定，預設使用 `/rss` 和 `/typefit`（Vite 代理）
- **生產**：設定為 `/api/rss` 和 `/api/data`（Vercel Edge Functions）
