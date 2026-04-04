export const config = { runtime: 'edge' }

export default async function handler() {
  const res = await fetch('https://type.fit/data/typing-texts.json')
  const text = await res.text()

  return new Response(text, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
