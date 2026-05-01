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

Retourne EXCLUSIVEMENT un objet JSON avec cette structure exacte :
{
  "name": "Nom du produit attractif en français",
  "slug": "slug-url-friendly",
  "category": "tech|maison|mode|beaute|outils",
  "images": ["url_image_1", "url_image_2"],
  "badge": "TOP VENTE|NOUVEAU|PROMO -XX%|BEST DEAL" ou null,
  "badge_color": "gold|red" ou null,
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
}

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

  // Strip markdown code blocks
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  }

  // Try parsing directly
  try {
    return JSON.parse(jsonStr)
  } catch {
    // Fallback: extract the first top-level JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No JSON found in response')
  }
}

serve(async (req) => {
  // CORS handling
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
    const { url, imageBase64 } = await req.json()

    if (!url && !imageBase64) {
      return new Response(JSON.stringify({ error: 'url or imageBase64 is required' }), {
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

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageBase64 } },
          {
            type: 'text',
            text: url
              ? `Lien du produit: ${url}\nAnalyse cette image et cherche les infos sur les plateformes chinoises.`
              : `Analyse cette image de produit et cherche les informations sur les plateformes chinoises (Taobao, Pinduoduo, 1688, Alibaba, etc.).`,
          },
        ],
      })
    } else {
      messages.push({
        role: 'user',
        content: `Lien du produit: ${url}\nAnalyse ce produit en faisant une recherche sur les plateformes chinoises et retourne les données pour le catalogue.`,
      })
    }

    // Build request body (no response_format with kimi-k2.6 + images)
    const body: Record<string, unknown> = {
      model: 'kimi-k2.6',
      messages,
      temperature: 1,
      max_tokens: 4096,
    }

    console.log('[Kimi Edge] Calling Kimi API with model kimi-k2.6...')
    const kimiResp = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!kimiResp.ok) {
      const kimiErrorBody = await kimiResp.text()
      console.error('[Kimi Edge] Kimi API error:', kimiResp.status, kimiErrorBody)
      return new Response(
        JSON.stringify({ error: `Kimi API error ${kimiResp.status}: ${kimiErrorBody.substring(0, 200)}` }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const kimiData = await kimiResp.json()
    const message = kimiData.choices?.[0]?.message
    const rawContent = message?.content || message?.reasoning_content || ''

    if (!rawContent) {
      console.error('[Kimi Edge] Empty response from Kimi:', JSON.stringify(kimiData).substring(0, 500))
      return new Response(
        JSON.stringify({ error: 'Empty response from Kimi AI' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('[Kimi Edge] Kimi response received, parsing JSON...')

    // Parse JSON
    const productData = parseJsonFromResponse(rawContent) as Record<string, unknown>

    // Prepare product for insertion
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

    // Insert into Supabase
    console.log('[Kimi Edge] Inserting product into Supabase...')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (insertError) {
      // If slug conflict, add timestamp and retry
      if (insertError.code === '23505') {
        product.slug = `${product.slug}-${Date.now()}`
        const { data: retryProduct, error: retryError } = await supabase
          .from('products')
          .insert(product)
          .select()
          .single()

        if (retryError) {
          console.error('[Kimi Edge] Insert retry failed:', retryError)
          return new Response(
            JSON.stringify({ error: `Insert failed: ${retryError.message}` }),
            { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          )
        }
        console.log('[Kimi Edge] Product imported successfully (retry)')
        return new Response(
          JSON.stringify({ success: true, product: retryProduct }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        )
      }

      console.error('[Kimi Edge] Insert failed:', insertError)
      return new Response(
        JSON.stringify({ error: `Insert failed: ${insertError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    console.log('[Kimi Edge] Product imported successfully:', insertedProduct.name)
    return new Response(
      JSON.stringify({ success: true, product: insertedProduct }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (err) {
    console.error('[Kimi Edge] Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
