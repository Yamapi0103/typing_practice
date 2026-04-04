export const config = { runtime: 'edge' }

export default async function handler() {
  const res = await fetch(
    'https://www.edu.tw/Rss_News.aspx?n=9E7AC85F1954DDA8',
  )
  const text = await res.text()
  return new Response(text, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
