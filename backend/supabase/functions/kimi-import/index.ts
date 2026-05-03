import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'
const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const SYSTEM_PROMPT = `Tu es un expert en e-commerce et import-export Chine-Afrique. Ta mission est d'analyser un produit depuis les plateformes chinoises et de générer toutes les données nécessaires pour le catalogue "China Express" — un marketplace d'import-export de Shenzhen vers le Burkina Faso.

SOURCES DE RECHERCHE PRIORITAIRES :
- Taobao (taobao.com)
- Pinduoduo / PDD (pinduoduo.com)
- 1688 (1688.com)
- Alibaba (alibaba.com)
- AliExpress (aliexpress.com)
- JD.com (jd.com)
- DHgate (dhgate.com)
- Made-in-China (made-in-china.com)

Quand tu reçois un lien ou une image de produit, tu dois :
1. Utiliser ta recherche internet pour analyser le produit sur les sites chinois ci-dessus
2. Trouver les caractéristiques techniques, specs, matériaux, etc.
3. Chercher les prix réels sur ces plateformes (prix fournisseur chinois)
4. Générer un argumentaire marketing convaincant en français (orienté revente en Afrique de l'Ouest)
5. Estimer les prix de revente en FCFA (XOF)

Règles de prix en FCFA :
- retail_price: prix fournisseur chinois trouvé x 1.5 à 2
- wholesale_price: prix fournisseur chinois trouvé x 1.2 à 1.4
- suggested_sell_price: retail_price x 1.3 à 1.5
- min_retail: 1
- min_wholesale: 10 à 50

Catégories: tech, maison, mode, beaute, outils`

const JSON_TEMPLATE = JSON.stringify({
  "name": "Nom du produit attractif en français",
  "slug": "slug-url-friendly",
  "category": "tech",
  "images": ["https://example.com/img1.jpg"],
  "badge": "TOP VENTE",
  "badge_color": "gold",
  "description": "Description marketing convaincante en français (150-250 mots)",
  "retail_price": 12000,
  "wholesale_price": 7500,
  "min_retail": 1,
  "min_wholesale": 20,
  "suggested_sell_price": 22000,
  "weight_kg": 0.5,
  "dimensions": "10x50x40",
  "rating": 4.5,
  "reviews": 0,
  "trending": false
}, null, 2)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80)
}

function parseJsonFromResponse(content: string): Record<string, unknown> {
  let jsonStr = content

  // Step 1: Strip markdown code blocks
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  }

  // Step 2: Try parsing directly
  try {
    const parsed = JSON.parse(jsonStr)
    if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
      return parsed
    }
  } catch {
    // fallthrough
  }

  // Step 3: Key-pattern extraction — find { that is followed by "name"
  const expectedKeys = ['"name"', '"slug"', '"category"', '"description"', '"retail_price"']

  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === '{') {
      const snippet = jsonStr.substring(i, Math.min(i + 300, jsonStr.length))
      const hasNameKey = expectedKeys.every((key) => snippet.includes(key))

      if (hasNameKey) {
        let depth = 0
        let endIdx = -1
        let inString = false
        let escapeNext = false

        for (let j = i; j < jsonStr.length; j++) {
          const ch = jsonStr[j]

          if (escapeNext) {
            escapeNext = false
            continue
          }
          if (ch === '\\') {
            escapeNext = true
            continue
          }
          if (ch === '"') {
            inString = !inString
            continue
          }
          if (!inString) {
            if (ch === '{') depth++
            if (ch === '}') {
              depth--
              if (depth === 0) {
                endIdx = j
                break
              }
            }
          }
        }

        if (endIdx !== -1) {
          const candidate = jsonStr.substring(i, endIdx + 1)
          try {
            const parsed = JSON.parse(candidate)
            if (typeof parsed === 'object' && parsed !== null) {
              return parsed
            }
          } catch {
            // try next candidate
          }
        }
      }
    }
  }

  // Step 4: Fallback — brace depth scan
  let depth = 0
  let startIdx = -1
  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === '{') {
      if (depth === 0) startIdx = i
      depth++
    } else if (jsonStr[i] === '}') {
      depth--
      if (depth === 0 && startIdx !== -1) {
        const candidate = jsonStr.substring(startIdx, i + 1)
        try {
          const parsed = JSON.parse(candidate)
          if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
            return parsed
          }
        } catch {
          // continue
        }
      }
    }
  }

  throw new Error(`No JSON found in response. Raw: ${content.substring(0, 300)}`)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'import'

    const body = await req.json()
    const { url: productUrl, imageBase64, imageBase64s } = body

    const hasImages = imageBase64 || (imageBase64s && imageBase64s.length > 0)
    if (!productUrl && !hasImages) {
      return new Response(JSON.stringify({ error: 'url or image(s) required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Build messages
    const messages: Array<{ role: string; content: unknown }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    const imageList: Array<{ type: string; image_url: { url: string } }> = []

    if (imageBase64) {
      imageList.push({ type: 'image_url', image_url: { url: imageBase64 } })
    }
    if (imageBase64s && Array.isArray(imageBase64s)) {
      for (const img of imageBase64s) {
        imageList.push({ type: 'image_url', image_url: { url: img } })
      }
    }

    const jsonInstructionWithUrl = `Lien: ${productUrl}\n\nAnalyse ce produit et retourne la réponse FINALE sous forme de cet objet JSON exact (sans aucun texte avant ou après le JSON, pas de markdown, pas de backtick code blocks):\n` + JSON_TEMPLATE
    const jsonInstructionNoUrl = `Analyse ce produit et retourne la réponse FINALE sous forme de cet objet JSON exact (sans aucun texte avant ou après le JSON, pas de markdown, pas de backtick code blocks):\n` + JSON_TEMPLATE

    if (imageList.length > 0) {
      const contentParts: Array<{ type: string; text?: string; image_url?: unknown }> = []
      for (const img of imageList) {
        contentParts.push(img)
      }
      contentParts.push({
        type: 'text',
        text: productUrl ? jsonInstructionWithUrl : jsonInstructionNoUrl,
      })
      messages.push({ role: 'user', content: contentParts })
    } else {
      messages.push({
        role: 'user',
        content: jsonInstructionWithUrl,
      })
    }

    // Model selection based on input type:
    // - URL-only (web search): kimi-k2.6 with temperature:1, top_p:0.95 (reasoning model)
    // - Images: kimi-k2.5 with temperature:0.7, top_p:0.9 (supports images + returns content field)
    // kimi-k2.6 has a bug with images: only produces reasoning_content, never content
    // moonshot-v1-128k does NOT support image inputs
    const isImageOnly = hasImages && !productUrl
    const model = isImageOnly ? 'kimi-k2.5' : 'kimi-k2.6'

    const kimiBody: Record<string, unknown> = {
      model,
      messages,
      temperature: 1,
      max_tokens: 2048,
      top_p: 0.95,
    }

    console.log(`[Kimi] Calling API with model ${model}...`)
    const startTime = Date.now()
    const kimiResp = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify(kimiBody),
    })

    if (!kimiResp.ok) {
      const kimiErrorBody = await kimiResp.text()
      console.error('[Kimi] API error:', kimiResp.status, kimiErrorBody)
      return new Response(
        JSON.stringify({ error: `API error ${kimiResp.status}: ${kimiErrorBody.substring(0, 200)}` }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const kimiData = await kimiResp.json()
    const elapsed = Date.now() - startTime
    console.log(`[Kimi] Response received in ${elapsed}ms`)

    const message = kimiData.choices?.[0]?.message
    const rawContent = (message?.content && message.content.trim()) || ''

    if (!rawContent) {
      console.error('[Kimi] Empty response:', JSON.stringify(kimiData).substring(0, 500))
      return new Response(
        JSON.stringify({ error: 'Empty response from AI' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('[Kimi] Raw response preview:', rawContent.substring(0, 500))
    console.log('[Kimi] Parsing JSON...')

    const productData = parseJsonFromResponse(rawContent) as Record<string, unknown>

    const product = {
      name: (productData.name as string) || 'Produit AI',
      slug: slugify((productData.name as string) || `ai-${Date.now()}`),
      category: (productData.category as string) || 'tech',
      images: (productData.images as string[]) || [],
      badge: (productData.badge as string) || null,
      badge_color: (productData.badge_color as string) || null,
      description: (productData.description as string) || 'Description en cours de rédaction.',
      retail_price: (productData.retail_price as number) || 5000,
      wholesale_price: (productData.wholesale_price as number) || 3000,
      min_retail: (productData.min_retail as number) || 1,
      min_wholesale: (productData.min_wholesale as number) || 10,
      suggested_sell_price: (productData.suggested_sell_price as number) || 8000,
      weight_kg: (productData.weight_kg as number) || 0.5,
      dimensions: (productData.dimensions as string) || '10x50x40',
      rating: (productData.rating as number) || 4.0,
      reviews: (productData.reviews as number) || 0,
      trending: (productData.trending as boolean) || false,
      status: 'draft',
    }

    if (action === 'analyze') {
      console.log('[Kimi] Analyze mode: returning product data')
      return new Response(
        JSON.stringify({ success: true, product }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('[Kimi] Import mode: inserting product into Supabase...')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        product.slug = `${product.slug}-${Date.now()}`
        const { data: retryProduct, error: retryError } = await supabase
          .from('products')
          .insert(product)
          .select()
          .single()

        if (retryError) {
          console.error('[Kimi] Insert retry failed:', retryError)
          return new Response(
            JSON.stringify({ error: `Insert failed: ${retryError.message}` }),
            { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          )
        }
        console.log('[Kimi] Product imported successfully (retry)')
        return new Response(
          JSON.stringify({ success: true, product: retryProduct }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
      }

      console.error('[Kimi] Insert failed:', insertError)
      return new Response(
        JSON.stringify({ error: `Insert failed: ${insertError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('[Kimi] Product imported successfully:', insertedProduct.name)
    return new Response(
      JSON.stringify({ success: true, product: insertedProduct }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (err) {
    console.error('[Kimi] Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
