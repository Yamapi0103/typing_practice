export interface Sentence {
  text: string
  level: 1 | 2 | 3
}

export const SENTENCES: Sentence[] = [
  { text: '今天天氣很好', level: 1 },
  { text: '我喜歡吃蘋果', level: 1 },
  { text: '台灣是美麗的島嶼', level: 1 },
  { text: '早安你好今天過得如何', level: 1 },
  { text: '請問廁所在哪裡', level: 1 },
  { text: '我想學習打字速度', level: 1 },
  { text: '春天花朵盛開非常漂亮', level: 1 },
  { text: '小朋友快樂地在操場玩耍', level: 1 },

  { text: '電腦科技日新月異改變了人們的生活方式', level: 2 },
  { text: '閱讀是獲取知識的最好方法之一', level: 2 },
  { text: '運動有益健康每天應該保持適度運動', level: 2 },
  { text: '台北是台灣的首都也是最繁榮的城市', level: 2 },
  { text: '學習一門外語需要持之以恆的練習', level: 2 },
  { text: '音樂能夠撫慰人心帶來心靈的平靜', level: 2 },
  { text: '環境保護是每個人的責任要珍惜地球資源', level: 2 },
  { text: '美食是台灣文化的重要組成部分讓人流連忘返', level: 2 },

  { text: '在這個資訊爆炸的時代我們需要培養批判性思考的能力以分辨真假訊息', level: 3 },
  { text: '台灣擁有豐富的自然生態和多元的文化背景吸引了無數來自世界各地的旅客', level: 3 },
  { text: '科學技術的進步帶來了便利的生活但同時也衍生出許多值得深思的社會問題', level: 3 },
  { text: '持續學習與自我成長是在競爭激烈的現代社會中保持競爭力的關鍵因素', level: 3 },
]

export function getRandomSentence(level: 1 | 2 | 3 | null = null): Sentence {
  const pool = level ? SENTENCES.filter(s => s.level === level) : SENTENCES
  return pool[Math.floor(Math.random() * pool.length)]
}
