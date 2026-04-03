export interface KeyDef {
  key: string
  display: string
  bopomofo: string
  finger: string
}

// finger: 1=小指, 2=無名指, 3=中指, 4=食指, 5=拇指
// hand: L=左, R=右
export const FINGER_COLORS: Record<string, string> = {
  'L1': '#ef4444',
  'L2': '#f97316',
  'L3': '#eab308',
  'L4': '#22c55e',
  'L5': '#06b6d4',
  'R5': '#06b6d4',
  'R4': '#3b82f6',
  'R3': '#8b5cf6',
  'R2': '#ec4899',
  'R1': '#f43f5e',
}

export const FINGER_NAMES: Record<string, string> = {
  'L1': '左小指', 'L2': '左無名指', 'L3': '左中指', 'L4': '左食指', 'L5': '左拇指',
  'R5': '右拇指', 'R4': '右食指', 'R3': '右中指', 'R2': '右無名指', 'R1': '右小指',
}

export const KEYBOARD_ROWS: KeyDef[][] = [
  // Number row
  [
    { key: '`', display: '`',  bopomofo: '',   finger: 'L1' },
    { key: '1', display: '1',  bopomofo: 'ㄅ', finger: 'L1' },
    { key: '2', display: '2',  bopomofo: 'ㄉ', finger: 'L2' },
    { key: '3', display: '3',  bopomofo: 'ˇ',  finger: 'L3' },
    { key: '4', display: '4',  bopomofo: 'ˋ',  finger: 'L3' },
    { key: '5', display: '5',  bopomofo: 'ㄓ', finger: 'L4' },
    { key: '6', display: '6',  bopomofo: 'ˊ',  finger: 'R4' },
    { key: '7', display: '7',  bopomofo: 'ˊ',  finger: 'R4' },
    { key: '8', display: '8',  bopomofo: 'ㄚ', finger: 'R3' },
    { key: '9', display: '9',  bopomofo: 'ㄞ', finger: 'R2' },
    { key: '0', display: '0',  bopomofo: 'ㄢ', finger: 'R2' },
    { key: '-', display: '-',  bopomofo: 'ㄦ', finger: 'R1' },
    { key: '=', display: '=',  bopomofo: '',   finger: 'R1' },
  ],
  // QWERTY row
  [
    { key: 'q', display: 'Q',  bopomofo: 'ㄆ', finger: 'L1' },
    { key: 'w', display: 'W',  bopomofo: 'ㄊ', finger: 'L2' },
    { key: 'e', display: 'E',  bopomofo: 'ㄍ', finger: 'L3' },
    { key: 'r', display: 'R',  bopomofo: 'ㄐ', finger: 'L4' },
    { key: 't', display: 'T',  bopomofo: 'ㄔ', finger: 'L4' },
    { key: 'y', display: 'Y',  bopomofo: 'ㄗ', finger: 'R4' },
    { key: 'u', display: 'U',  bopomofo: 'ㄧ', finger: 'R4' },
    { key: 'i', display: 'I',  bopomofo: 'ㄛ', finger: 'R3' },
    { key: 'o', display: 'O',  bopomofo: 'ㄟ', finger: 'R2' },
    { key: 'p', display: 'P',  bopomofo: 'ㄣ', finger: 'R1' },
    { key: '[', display: '[',  bopomofo: '',   finger: 'R1' },
    { key: ']', display: ']',  bopomofo: '',   finger: 'R1' },
  ],
  // ASDF row
  [
    { key: 'a', display: 'A',  bopomofo: 'ㄇ', finger: 'L1' },
    { key: 's', display: 'S',  bopomofo: 'ㄋ', finger: 'L2' },
    { key: 'd', display: 'D',  bopomofo: 'ㄎ', finger: 'L3' },
    { key: 'f', display: 'F',  bopomofo: 'ㄑ', finger: 'L4' },
    { key: 'g', display: 'G',  bopomofo: 'ㄕ', finger: 'L4' },
    { key: 'h', display: 'H',  bopomofo: 'ㄘ', finger: 'R4' },
    { key: 'j', display: 'J',  bopomofo: 'ㄨ', finger: 'R4' },
    { key: 'k', display: 'K',  bopomofo: 'ㄜ', finger: 'R3' },
    { key: 'l', display: 'L',  bopomofo: 'ㄠ', finger: 'R2' },
    { key: ';', display: ';',  bopomofo: 'ㄤ', finger: 'R1' },
    { key: "'", display: "'",  bopomofo: '',   finger: 'R1' },
  ],
  // ZXCV row
  [
    { key: 'z', display: 'Z',  bopomofo: 'ㄈ', finger: 'L1' },
    { key: 'x', display: 'X',  bopomofo: 'ㄌ', finger: 'L2' },
    { key: 'c', display: 'C',  bopomofo: 'ㄏ', finger: 'L3' },
    { key: 'v', display: 'V',  bopomofo: 'ㄒ', finger: 'L4' },
    { key: 'b', display: 'B',  bopomofo: 'ㄖ', finger: 'L4' },
    { key: 'n', display: 'N',  bopomofo: 'ㄙ', finger: 'R4' },
    { key: 'm', display: 'M',  bopomofo: 'ㄩ', finger: 'R4' },
    { key: ',', display: ',',  bopomofo: 'ㄝ', finger: 'R3' },
    { key: '.', display: '.',  bopomofo: 'ㄡ', finger: 'R2' },
    { key: '/', display: '/',  bopomofo: 'ㄥ', finger: 'R1' },
  ],
]

export const KEY_MAP: Record<string, KeyDef> = Object.fromEntries(
  KEYBOARD_ROWS.flat().map(k => [k.key, k])
)
