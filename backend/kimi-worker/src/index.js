const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const SYSTEM_PROMPT = `Tu es un expert en e-commerce et import-export Chine-Afrique. Ta mission est d'analyser un produit depuis les plateformes chinoises et de generer toutes les donnees necessaires pour le catalogue "China Express" — un marketplace d'import-export de Shenzhen vers le Burkina Faso.

SOURCES DE RECHERCHE PRIORITAIRES :
- Taobao (taobao.com)
- Pinduoduo / PDD (pinduoduo.com)
- 1688 (1688.com)
- Alibaba (alibaba.com)
- AliExpress (aliexpress.com)
- JD.com (jd.com)
- DHgate (dhgate.com)
- Made-in-China (made-in-china.com)

Quand tu recois un lien ou une image de produit, tu dois :
1. Utiliser ta recherche internet pour analyser le produit sur les sites chinois ci-dessus
2. Trouver les caracteristiques techniques, specs, materiaux, etc.
3. Chercher les prix reels sur ces plateformes (prix fournisseur chinois)
4. Generer un argumentaire marketing convaincant en francais (oriente revente en Afrique de l'Ouest)
5. Estimer les prix de revente en FCFA (XOF)

Retourne EXCLUSIVEMENT un objet JSON avec cette structure exacte :
{
  "name": "Nom du produit attractif en francais",
  "slug": "slug-url-friendly",
  "category": "tech|maison|mode|beaute|outils",
  "images": ["url_image_1", "url_image_2"],
  "badge": "TOP VENTE|NOUVEAU|PROMO -XX%|BEST DEAL" ou null,
  "badge_color": "gold|red" ou null,
  "description": "Description marketing convaincante en francais (150-250 mots)",
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

Regles de prix en FCFA :
- retail_price: prix fournisseur chinois trouve x 1.5 a 2
- wholesale_price: prix fournisseur chinois trouve x 1.2 a 1.4
- suggested_sell_price: retail_price x 1.3 a 1.5
- min_retail: 1
- min_wholesale: 10 a 50

Categories: tech, maison, mode, beaute, outils`;

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80);
}

function parseJsonFromResponse(content) {
  let jsonStr = content;

  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      const { url, imageBase64 } = await request.json();

      if (!url && !imageBase64) {
        return new Response(JSON.stringify({ error: 'url or imageBase64 is required' }), {
          status: 400,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      // Build messages
      const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

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
        });
      } else {
        messages.push({
          role: 'user',
          content: `Lien du produit: ${url}\nAnalyse ce produit en faisant une recherche sur les plateformes chinoises et retourne les donnees pour le catalogue.`,
        });
      }

      // Call Kimi K2.6 API
      console.log('[Worker] Calling Kimi K2.6...');
      const kimiResp = await fetch(KIMI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.KIMI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'kimi-k2.6',
          messages,
          temperature: 1,
          max_tokens: 4096,
        }),
      });

      if (!kimiResp.ok) {
        const kimiErrorBody = await kimiResp.text();
        console.error('[Worker] Kimi API error:', kimiResp.status, kimiErrorBody);
        return new Response(
          JSON.stringify({ error: `Kimi API error ${kimiResp.status}: ${kimiErrorBody.substring(0, 200)}` }),
          { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        );
      }

      const kimiData = await kimiResp.json();
      const message = kimiData.choices?.[0]?.message;
      const rawContent = message?.content || message?.reasoning_content || '';

      if (!rawContent) {
        console.error('[Worker] Empty response from Kimi:', JSON.stringify(kimiData).substring(0, 500));
        return new Response(
          JSON.stringify({ error: 'Empty response from Kimi AI' }),
          { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        );
      }

      console.log('[Worker] Kimi response received, parsing JSON...');
      const productData = parseJsonFromResponse(rawContent);

      // Prepare product
      const product = {
        name: productData.name || 'Produit AI',
        slug: slugify(productData.name || `ai-${Date.now()}`),
        category: productData.category || 'tech',
        images: productData.images || [],
        badge: productData.badge || null,
        badge_color: productData.badge_color || null,
        description: productData.description || 'Description en cours de redaction.',
        retail_price: productData.retail_price || 5000,
        wholesale_price: productData.wholesale_price || 3000,
        min_retail: productData.min_retail || 1,
        min_wholesale: productData.min_wholesale || 10,
        suggested_sell_price: productData.suggested_sell_price || 8000,
        weight_kg: productData.weight_kg || 0.5,
        dimensions: productData.dimensions || '10x50x40',
        rating: productData.rating || 4.0,
        reviews: productData.reviews || 0,
        trending: productData.trending || false,
        status: 'draft',
      };

      // Insert into Supabase via REST API
      console.log('[Worker] Inserting product into Supabase...');
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

      const insertResp = await fetch(`${supabaseUrl}/rest/v1/products`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(product),
      });

      if (!insertResp.ok) {
        const errorBody = await insertResp.text();
        // Slug conflict - retry with timestamp
        if (insertResp.status === 409) {
          product.slug = `${product.slug}-${Date.now()}`;
          const retryResp = await fetch(`${supabaseUrl}/rest/v1/products`, {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify(product),
          });

          if (!retryResp.ok) {
            const retryError = await retryResp.text();
            console.error('[Worker] Insert retry failed:', retryError);
            return new Response(
              JSON.stringify({ error: `Insert failed: ${retryError.substring(0, 200)}` }),
              { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
            );
          }

          const retryData = await retryResp.json();
          console.log('[Worker] Product imported successfully (retry)');
          return new Response(
            JSON.stringify({ success: true, product: retryData[0] }),
            { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
          );
        }

        console.error('[Worker] Insert failed:', errorBody);
        return new Response(
          JSON.stringify({ error: `Insert failed: ${errorBody.substring(0, 200)}` }),
          { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        );
      }

      const insertedData = await insertResp.json();
      console.log('[Worker] Product imported successfully:', insertedData[0]?.name);
      return new Response(
        JSON.stringify({ success: true, product: insertedData[0] }),
        { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('[Worker] Unhandled error:', err.message);
      return new Response(
        JSON.stringify({ error: err.message || 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }
  },
};
