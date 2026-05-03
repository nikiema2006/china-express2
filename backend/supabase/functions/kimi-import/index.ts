import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'
const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

const IMAGE_ANALYSIS_PROMPT = `Analyse cette image de produit. Retourne UNIQUEMENT du JSON.

{
  "name": "string - nom du produit en français, 2-5 mots",
  "slug": "string - slug en minuscules avec tirets",
  "category": "string: tech, maison, mode, beaute, outils",
  "images": ["url1"],
  "badge": "string|null: TOP VENTE, NOUVEAU, PROMO ou null",
  "badge_color": "string|null: gold, red, blue, green",
  "description": "string - description marketing courte 50-80 mots en français",
  "retail_price": "number - prix détail FCFA",
  "wholesale_price": "number - prix gros FCFA",
  "min_retail": "number - min détail (1)",
  "min_wholesale": "number - min gros (10-50)",
  "suggested_sell_price": "number - prix conseillé FCFA",
  "weight_kg": "number - poids kg",
  "dimensions": "string - LxlxH cm",
  "rating": "number - note/5",
  "reviews": "number - nb avis",
  "trending": "boolean"
}

Prix: ¥ × 85 × 1.75 (retail), ¥ × 85 × 1.3 (wholesale). Réponds en JSON uniquement.`

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

/**
 * Extract a string field value from reasoning text by finding "field": "..." pattern.
 * Handles truncated strings, escaped characters, and multi-line values.
 */
function extractStringField(reasoning: string, fieldName: string): string | null {
  // Find the pattern: "fieldName": "
  const fieldPattern = `"${fieldName}"\\s*:\\s*"`
  const regex = new RegExp(fieldPattern, 'i')
  const startMatch = reasoning.match(regex)
  if (!startMatch) return null

  const valueStart = startMatch.index! + startMatch[0].length

  // Extract string value character by character, tracking escapes
  let value = ''
  let escapeNext = false
  for (let i = valueStart; i < reasoning.length; i++) {
    const ch = reasoning[i]

    if (escapeNext) {
      value += ch === '"' ? '"' : `\\${ch}`
      escapeNext = false
      continue
    }

    if (ch === '\\') {
      escapeNext = true
      continue
    }

    if (ch === '"') {
      // Found closing quote — string is complete
      return value.length > 0 ? value : null
    }

    // Handle edge cases: newlines, special chars
    if (ch === '\n' || ch === '\r') {
      value += ' '
      continue
    }

    value += ch

    // Safety: if string gets too long (>5000 chars), it's likely truncated
    if (value.length > 5000) {
      return value.substring(0, 4000).trim()
    }
  }

  // No closing quote found — string is truncated, return what we have if meaningful
  if (value.length > 10) {
    return value.substring(0, 4000).trim()
  }
  return null
}

/**
 * Extract individual fields from reasoning_content using pattern matching.
 * Used when the API only produces reasoning_content with no content field.
 */
function extractFieldsFromReasoning(reasoning: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  // Extract string fields using character-by-character parser
  const stringFields = ['name', 'slug', 'category', 'description', 'badge', 'badge_color', 'dimensions']
  for (const field of stringFields) {
    const val = extractStringField(reasoning, field)
    if (val) {
      result[field] = val
    }
  }

  // Extract number fields
  const numberFields = ['retail_price', 'wholesale_price', 'min_retail', 'min_wholesale', 'suggested_sell_price', 'weight_kg', 'rating', 'reviews']
  for (const field of numberFields) {
    const pattern = new RegExp(`"${field}"\\s*:\\s*(\\d+(?:\\.\\d+)?)`, 'i')
    const match = reasoning.match(pattern)
    if (match) {
      result[field] = parseFloat(match[1])
    }
  }

  // Extract boolean fields
  for (const field of ['trending']) {
    const pattern = new RegExp(`"${field}"\\s*:\\s*(true|false)`, 'i')
    const match = reasoning.match(pattern)
    if (match) {
      result[field] = match[1].toLowerCase() === 'true'
    }
  }

  // Extract images array
  const imagesMatch = reasoning.match(/"images"\s*:\s*\[([^\]]*)\]/i)
  if (imagesMatch) {
    const innerContent = imagesMatch[1]
    const urls = innerContent.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)
    if (urls && urls.length > 0) {
      result['images'] = urls.map(u => u.replace(/"/g, '').replace(/\\n/g, '\n').replace(/\\u0027/g, "'"))
    }
  }

  // If JSON-format extraction failed, try natural language patterns
  if (Object.keys(result).length === 0) {
    // Extract product name
    for (const p of [/Product\s*[:：]\s*([^\n\-]+)/i, /Produit\s*[:：]\s*([^\n\-]+)/i]) {
      const m = reasoning.match(p)
      if (m && m[1].trim().length > 2) {
        result['name'] = m[1].trim().replace(/\s+/g, ' ').substring(0, 80)
        break
      }
    }

    // Extract prices from ¥ patterns
    const pricePatterns = [/¥\s*(\d+(?:\.\d+)?)\s*(?:yuan|RMB|CNY)?/gi, /price\s*[:：]\s*¥?\s*(\d+(?:\.\d+)?)/i]
    const allPrices: number[] = []
    for (const p of pricePatterns) {
      let m
      while ((m = p.exec(reasoning)) !== null) {
        allPrices.push(parseFloat(m[1]))
      }
    }
    if (allPrices.length > 0) {
      const basePrice = Math.min(...allPrices)
      result['retail_price'] = Math.round(basePrice * 85 * 1.75)
      result['wholesale_price'] = Math.round(basePrice * 85 * 1.3)
      result['suggested_sell_price'] = Math.round(result['retail_price'] * 1.4)
    }

    // Extract category from keywords
    const lower = reasoning.toLowerCase()
    if (/shoe|sneaker|basket|chaussure|boot|sandale/i.test(lower)) result['category'] = 'mode'
    else if (/phone|casque|bluetooth|tech|electronic|cable|charger/i.test(lower)) result['category'] = 'tech'
    else if (/maison|home|kitchen|cuisine|deco|furniture/i.test(lower)) result['category'] = 'maison'
    else if (/beauty|cream|makeup|beaute|cosmetic|skin/i.test(lower)) result['category'] = 'beaute'
    else if (/tool|outil|hammer|drill|wrench/i.test(lower)) result['category'] = 'outils'

    // Extract description: longest meaningful paragraph
    const paragraphs = reasoning.split(/\n\n+/)
    let longestDesc = ''
    for (const p of paragraphs) {
      const cleaned = p.replace(/^[-•*\s]+/, '').trim()
      if (cleaned.length > longestDesc.length && cleaned.length > 50 && cleaned.length < 800) {
        longestDesc = cleaned
      }
    }
    if (longestDesc) result['description'] = longestDesc

    // Badge detection
    if (/top\s*vente|best\s*seller|bestseller|populaire/i.test(lower)) result['badge'] = 'TOP VENTE'
    else if (/nouveau|new\s*arrival/i.test(lower)) result['badge'] = 'NOUVEAU'
    else if (/promo|promotion|deal|offer/i.test(lower)) result['badge'] = 'PROMO'

    // Defaults
    if (!result['min_retail']) result['min_retail'] = 1
    if (!result['min_wholesale']) result['min_wholesale'] = 20
    if (!result['weight_kg']) result['weight_kg'] = 0.5
    if (!result['dimensions']) result['dimensions'] = '30x20x10'
    if (!result['rating']) result['rating'] = 4.5
    if (!result['reviews']) result['reviews'] = 0
    if (!result['badge_color']) result['badge_color'] = 'gold'
    if (!result['trending']) result['trending'] = false
    if (!result['images']) result['images'] = []
    if (!result['slug'] && result['name']) {
      result['slug'] = String(result['name'])
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 80)
    }
  }

  return result
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

    const isImageOnly = hasImages && !productUrl

    // Build messages
    const messages: Array<{ role: string; content: unknown }> = []

    // Use IMAGE_ANALYSIS_PROMPT for image-only requests, SYSTEM_PROMPT for URL-based
    if (isImageOnly) {
      messages.push({ role: 'system', content: IMAGE_ANALYSIS_PROMPT })
    } else {
      messages.push({ role: 'system', content: SYSTEM_PROMPT })
    }

    const imageList: Array<{ type: string; image_url: { url: string } }> = []

    if (imageBase64) {
      imageList.push({ type: 'image_url', image_url: { url: imageBase64 } })
    }
    if (imageBase64s && Array.isArray(imageBase64s)) {
      for (const img of imageBase64s) {
        imageList.push({ type: 'image_url', image_url: { url: img } })
      }
    }

    const jsonInstructionWithUrl = `Lien: ${productUrl}\n\nAnalyse ce produit et retourne la réponse FINALE sous forme de cet objet JSON exact (sans aucun texte avant ou après le JSON, pas de markdown, pas de backtick code blocks):\n` + JSON_TEMPLATE + `\n\nIMPORTANT: Réponds UNIQUEMENT avec le JSON brut. Aucun texte avant, aucun texte après.`
    const jsonInstructionNoUrl = `Analyse cette image de produit et retourne UNIQUEMENT un objet JSON brut correspondant exactement au format ci-dessus.\n\nIMPORTANT: Ta réponse doit être UNIQUEMENT le JSON. Aucun texte avant, aucun texte après, aucun markdown, aucun code block.\n\nFormat requis:\n` + JSON_TEMPLATE

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

    // Use kimi-k2.5 for image-only (faster vision model), k2.6 for URL+search
    const model = isImageOnly ? 'kimi-k2.5' : 'kimi-k2.6'

    const kimiBody: Record<string, unknown> = {
      model,
      messages,
      temperature: 1,
      max_tokens: 1024,
      top_p: 0.95,
      response_format: isImageOnly
        ? { type: 'json_object' }
        : {
            type: 'json_schema',
            json_schema: {
              name: 'product_analysis',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Nom attractif du produit en français' },
                  slug: { type: 'string', description: 'URL friendly en minuscules avec tirets' },
                  category: {
                    type: 'string',
                    enum: ['tech', 'maison', 'mode', 'beaute', 'outils'],
                  },
                  images: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'URLs des images du produit',
                  },
                  badge: { type: 'string', nullable: true, description: 'TOP VENTE, NOUVEAU, PROMO ou null' },
                  badge_color: { type: 'string', nullable: true, description: 'gold, red, blue, green ou null' },
                  description: { type: 'string', description: 'Description marketing en français 150-250 mots' },
                  retail_price: { type: 'integer', description: 'Prix de vente au détail en FCFA' },
                  wholesale_price: { type: 'integer', description: 'Prix de vente en gros en FCFA' },
                  min_retail: { type: 'integer', description: 'Quantité minimum pour achat au détail' },
                  min_wholesale: { type: 'integer', description: 'Quantité minimum pour achat en gros' },
                  suggested_sell_price: { type: 'integer', description: 'Prix de vente conseillé en FCFA' },
                  weight_kg: { type: 'number', description: 'Poids en kg' },
                  dimensions: { type: 'string', description: 'Dimensions format LxlxH en cm' },
                  rating: { type: 'number', description: 'Note sur 5' },
                  reviews: { type: 'integer', description: "Nombre d'avis" },
                  trending: { type: 'boolean', description: 'true si produit tendance' },
                },
                required: [
                  'name', 'slug', 'category', 'images', 'badge', 'badge_color',
                  'description', 'retail_price', 'wholesale_price', 'min_retail',
                  'min_wholesale', 'suggested_sell_price', 'weight_kg', 'dimensions',
                  'rating', 'reviews', 'trending',
                ],
                additionalProperties: false,
              },
            },
          },
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
    let rawContent = (message?.content && message.content.trim()) || ''
    let usedReasoningFallback = false

    // Fallback to reasoning_content if content is empty (common with kimi-k2.5)
    if (!rawContent && message?.reasoning_content) {
      usedReasoningFallback = true
      rawContent = (message.reasoning_content as string).trim()
      console.log('[Kimi] Using reasoning_content as fallback (content was empty)')

      // Try to parse reasoning_content as JSON first
      try {
        const parsedFromReasoning = JSON.parse(rawContent)
        if (typeof parsedFromReasoning === 'object' && parsedFromReasoning !== null && 'name' in parsedFromReasoning) {
          rawContent = JSON.stringify(parsedFromReasoning)
          console.log('[Kimi] Successfully parsed reasoning_content as valid JSON')
        } else {
          // Valid JSON but missing 'name' - try field-level extraction
          console.log('[Kimi] JSON parsed but missing name field, attempting field-level extraction')
        }
      } catch {
        // Not valid JSON - use field-level extraction
        console.log('[Kimi] reasoning_content is not valid JSON, using field-level extraction')
      }

      // If standard parsing fails, extract fields individually from reasoning_content
      if (!rawContent || (() => {
        try {
          parseJsonFromResponse(rawContent)
          return false
        } catch {
          return true
        }
      })()) {
        console.log('[Kimi] Attempting field-level extraction from reasoning_content...')
        const extractedFields = extractFieldsFromReasoning(rawContent)
        if (Object.keys(extractedFields).length > 0) {
          console.log(`[Kimi] Extracted ${Object.keys(extractedFields).length} fields from reasoning_content`)
          // Build JSON from extracted fields
          rawContent = JSON.stringify(extractedFields, null, 2)
          console.log('[Kimi] Rebuilt JSON from extracted fields:', rawContent.substring(0, 300))

          // Validate the rebuilt JSON
          try {
            const rebuiltJson = JSON.parse(rawContent)
            if (typeof rebuiltJson === 'object' && rebuiltJson !== null && 'name' in rebuiltJson) {
              console.log('[Kimi] Rebuilt JSON is valid')
            } else {
              console.log('[Kimi] WARNING: Rebuilt JSON missing name field, using defaults')
            }
          } catch (parseErr) {
            console.error('[Kimi] ERROR: Rebuilt JSON is invalid, clearing rawContent')
            rawContent = ''
          }
        }
      }
    }

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
      product_url: (productData.url as string) || productUrl || null,
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
