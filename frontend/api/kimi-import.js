const https = require('https');
const http = require('http');
const { URL } = require('url');

const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const KIMI_API_KEY = process.env.KIMI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = 'product-images';

const JSON_TEMPLATE = JSON.stringify({
  name: 'Nom du produit attractif en français',
  slug: 'slug-url-friendly',
  category: 'tech',
  images: ['https://example.com/img1.jpg'],
  badge: 'TOP VENTE',
  badge_color: 'gold',
  description: 'Description marketing convaincante en français (150-250 mots)',
  retail_price: 12000,
  wholesale_price: 7500,
  min_retail: 1,
  min_wholesale: 20,
  suggested_sell_price: 22000,
  weight_kg: 0.5,
  dimensions: '10x50x40',
  rating: 4.5,
  reviews: 0,
  trending: false,
}, null, 2);

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

Prix: ¥ × 85 × 1.75 (retail), ¥ × 85 × 1.3 (wholesale). Réponds en JSON uniquement.`;

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

Catégories: tech, maison, mode, beaute, outils`;

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
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
      return parsed;
    }
  } catch {
    // fallthrough
  }

  const expectedKeys = ['"name"', '"slug"', '"category"', '"description"', '"retail_price"'];

  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === '{') {
      const snippet = jsonStr.substring(i, Math.min(i + 300, jsonStr.length));
      const hasNameKey = expectedKeys.every((key) => snippet.includes(key));

      if (hasNameKey) {
        let depth = 0;
        let endIdx = -1;
        let inString = false;
        let escapeNext = false;

        for (let j = i; j < jsonStr.length; j++) {
          const ch = jsonStr[j];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          if (ch === '\\') {
            escapeNext = true;
            continue;
          }
          if (ch === '"') {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (ch === '{') depth++;
            if (ch === '}') {
              depth--;
              if (depth === 0) {
                endIdx = j;
                break;
              }
            }
          }
        }

        if (endIdx !== -1) {
          const candidate = jsonStr.substring(i, endIdx + 1);
          try {
            const parsed = JSON.parse(candidate);
            if (typeof parsed === 'object' && parsed !== null) {
              return parsed;
            }
          } catch {
            // try next candidate
          }
        }
      }
    }
  }

  let depth = 0;
  let startIdx = -1;
  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === '{') {
      if (depth === 0) startIdx = i;
      depth++;
    } else if (jsonStr[i] === '}') {
      depth--;
      if (depth === 0 && startIdx !== -1) {
        const candidate = jsonStr.substring(startIdx, i + 1);
        try {
          const parsed = JSON.parse(candidate);
          if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
            return parsed;
          }
        } catch {
          // continue
        }
      }
    }
  }

  throw new Error(`No JSON found in response. Raw: ${content.substring(0, 300)}`);
}

function extractStringField(reasoning, fieldName) {
  const fieldPattern = `"${fieldName}"\\s*:\\s*"`;
  const regex = new RegExp(fieldPattern, 'i');
  const startMatch = reasoning.match(regex);
  if (!startMatch) return null;

  const valueStart = startMatch.index + startMatch[0].length;

  let value = '';
  let escapeNext = false;
  for (let i = valueStart; i < reasoning.length; i++) {
    const ch = reasoning[i];

    if (escapeNext) {
      value += ch === '"' ? '"' : `\\${ch}`;
      escapeNext = false;
      continue;
    }

    if (ch === '\\') {
      escapeNext = true;
      continue;
    }

    if (ch === '"') {
      return value.length > 0 ? value : null;
    }

    if (ch === '\n' || ch === '\r') {
      value += ' ';
      continue;
    }

    value += ch;

    if (value.length > 5000) {
      return value.substring(0, 4000).trim();
    }
  }

  if (value.length > 10) {
    return value.substring(0, 4000).trim();
  }
  return null;
}

function extractFieldsFromReasoning(reasoning) {
  const result = {};

  const stringFields = ['name', 'slug', 'category', 'description', 'badge', 'badge_color', 'dimensions'];
  for (const field of stringFields) {
    const val = extractStringField(reasoning, field);
    if (val) {
      result[field] = val;
    }
  }

  const numberFields = ['retail_price', 'wholesale_price', 'min_retail', 'min_wholesale', 'suggested_sell_price', 'weight_kg', 'rating', 'reviews'];
  for (const field of numberFields) {
    const pattern = new RegExp(`"${field}"\\s*:\\s*(\\d+(?:\\.\\d+)?)`, 'i');
    const match = reasoning.match(pattern);
    if (match) {
      result[field] = parseFloat(match[1]);
    }
  }

  for (const field of ['trending']) {
    const pattern = new RegExp(`"${field}"\\s*:\\s*(true|false)`, 'i');
    const match = reasoning.match(pattern);
    if (match) {
      result[field] = match[1].toLowerCase() === 'true';
    }
  }

  const imagesMatch = reasoning.match(/"images"\s*:\s*\[([^\]]*)\]/i);
  if (imagesMatch) {
    const innerContent = imagesMatch[1];
    const urls = innerContent.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
    if (urls && urls.length > 0) {
      result['images'] = urls.map(u => u.replace(/"/g, '').replace(/\\n/g, '\n').replace(/\\u0027/g, "'"));
    }
  }

  if (Object.keys(result).length === 0) {
    for (const p of [/Product\s*[:：]\s*([^\n\-]+)/i, /Produit\s*[:：]\s*([^\n\-]+)/i]) {
      const m = reasoning.match(p);
      if (m && m[1].trim().length > 2) {
        result['name'] = m[1].trim().replace(/\s+/g, ' ').substring(0, 80);
        break;
      }
    }

    const pricePatterns = [/¥\s*(\d+(?:\.\d+)?)\s*(?:yuan|RMB|CNY)?/gi, /price\s*[:：]\s*¥?\s*(\d+(?:\.\d+)?)/i];
    const allPrices = [];
    for (const p of pricePatterns) {
      let m;
      while ((m = p.exec(reasoning)) !== null) {
        allPrices.push(parseFloat(m[1]));
      }
    }
    if (allPrices.length > 0) {
      const basePrice = Math.min(...allPrices);
      result['retail_price'] = Math.round(basePrice * 85 * 1.75);
      result['wholesale_price'] = Math.round(basePrice * 85 * 1.3);
      result['suggested_sell_price'] = Math.round(result['retail_price'] * 1.4);
    }

    const lower = reasoning.toLowerCase();
    if (/shoe|sneaker|basket|chaussure|boot|sandale/i.test(lower)) result['category'] = 'mode';
    else if (/phone|casque|bluetooth|tech|electronic|cable|charger/i.test(lower)) result['category'] = 'tech';
    else if (/maison|home|kitchen|cuisine|deco|furniture/i.test(lower)) result['category'] = 'maison';
    else if (/beauty|cream|makeup|beaute|cosmetic|skin/i.test(lower)) result['category'] = 'beaute';
    else if (/tool|outil|hammer|drill|wrench/i.test(lower)) result['category'] = 'outils';

    const paragraphs = reasoning.split(/\n\n+/);
    let longestDesc = '';
    for (const p of paragraphs) {
      const cleaned = p.replace(/^[-•*\s]+/, '').trim();
      if (cleaned.length > longestDesc.length && cleaned.length > 50 && cleaned.length < 800) {
        longestDesc = cleaned;
      }
    }
    if (longestDesc) result['description'] = longestDesc;

    if (/top\s*vente|best\s*seller|bestseller|populaire/i.test(lower)) result['badge'] = 'TOP VENTE';
    else if (/nouveau|new\s*arrival/i.test(lower)) result['badge'] = 'NOUVEAU';
    else if (/promo|promotion|deal|offer/i.test(lower)) result['badge'] = 'PROMO';

    if (!result['min_retail']) result['min_retail'] = 1;
    if (!result['min_wholesale']) result['min_wholesale'] = 20;
    if (!result['weight_kg']) result['weight_kg'] = 0.5;
    if (!result['dimensions']) result['dimensions'] = '30x20x10';
    if (!result['rating']) result['rating'] = 4.5;
    if (!result['reviews']) result['reviews'] = 0;
    if (!result['badge_color']) result['badge_color'] = 'gold';
    if (!result['trending']) result['trending'] = false;
    if (!result['images']) result['images'] = [];
    if (!result['slug'] && result['name']) {
      result['slug'] = String(result['name'])
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 80);
    }
  }

  return result;
}

function callKimiAPI(model, messages) {
  return new Promise((resolve, reject) => {
    const url = new URL(KIMI_API_URL);
    const body = JSON.stringify({
      model,
      messages,
      temperature: 1,
      max_tokens: 1024,
      top_p: 0.95,
      response_format: { type: 'json_object' },
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse Kimi response: ${data.substring(0, 200)}`));
          }
        } else {
          reject(new Error(`Kimi API error ${res.statusCode}: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('Kimi API request timed out after 120s'));
    });

    req.write(body);
    req.end();
  });
}

async function insertProduct(supabaseUrl, serviceRoleKey, product) {
  const body = JSON.stringify(product);
  const url = `${supabaseUrl}/rest/v1/products`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(supabaseUrl).hostname,
      port: 443,
      path: `/rest/v1/products`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'return=representation',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve(Array.isArray(parsed) ? parsed[0] : parsed);
          } catch (e) {
            resolve({ id: null });
          }
        } else {
          try {
            const errorData = JSON.parse(data);
            reject(new Error(errorData.message || errorData.error || `Supabase error ${res.statusCode}`));
          } catch {
            reject(new Error(`Supabase error ${res.statusCode}: ${data.substring(0, 200)}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Supabase request timed out'));
    });

    req.write(body);
    req.end();
  });
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!KIMI_API_KEY) {
    res.status(500).json({ error: 'KIMI_API_KEY not configured' });
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.searchParams.get('action') || 'import';

    const body = req.body;
    const { url: productUrl, imageBase64, imageBase64s } = body;

    const hasImages = imageBase64 || (imageBase64s && imageBase64s.length > 0);
    if (!productUrl && !hasImages) {
      res.status(400).json({ error: 'url or image(s) required' });
      return;
    }

    const isImageOnly = hasImages && !productUrl;

    const messages = [];

    if (isImageOnly) {
      messages.push({ role: 'system', content: IMAGE_ANALYSIS_PROMPT });
    } else {
      messages.push({ role: 'system', content: SYSTEM_PROMPT });
    }

    const imageList = [];

    if (imageBase64) {
      imageList.push({ type: 'image_url', image_url: { url: imageBase64 } });
    }
    if (imageBase64s && Array.isArray(imageBase64s)) {
      for (const img of imageBase64s) {
        imageList.push({ type: 'image_url', image_url: { url: img } });
      }
    }

    const jsonInstructionWithUrl = `Lien: ${productUrl}\n\nAnalyse ce produit et retourne la réponse FINALE sous forme de cet objet JSON exact (sans aucun texte avant ou après le JSON, pas de markdown, pas de backtick code blocks):\n` + JSON_TEMPLATE + `\n\nIMPORTANT: Réponds UNIQUEMENT avec le JSON brut. Aucun texte avant, aucun texte après.`;
    const jsonInstructionNoUrl = `Analyse cette image de produit et retourne UNIQUEMENT un objet JSON brut correspondant exactement au format ci-dessus.\n\nIMPORTANT: Ta réponse doit être UNIQUEMENT le JSON. Aucun texte avant, aucun texte après, aucun markdown, aucun code block.\n\nFormat requis:\n` + JSON_TEMPLATE;

    if (imageList.length > 0) {
      const contentParts = [...imageList];
      contentParts.push({
        type: 'text',
        text: productUrl ? jsonInstructionWithUrl : jsonInstructionNoUrl,
      });
      messages.push({ role: 'user', content: contentParts });
    } else {
      messages.push({
        role: 'user',
        content: jsonInstructionWithUrl,
      });
    }

    const model = isImageOnly ? 'kimi-k2.5' : 'kimi-k2.6';

    console.log(`[Kimi] Calling API with model ${model}...`);
    const startTime = Date.now();
    const kimiData = await callKimiAPI(model, messages);
    const elapsed = Date.now() - startTime;
    console.log(`[Kimi] Response received in ${elapsed}ms`);

    const message = kimiData.choices?.[0]?.message;
    let rawContent = (message?.content && message.content.trim()) || '';

    if (!rawContent && message?.reasoning_content) {
      rawContent = message.reasoning_content.trim();
      console.log('[Kimi] Using reasoning_content as fallback (content was empty)');

      try {
        const parsedFromReasoning = JSON.parse(rawContent);
        if (typeof parsedFromReasoning === 'object' && parsedFromReasoning !== null && 'name' in parsedFromReasoning) {
          rawContent = JSON.stringify(parsedFromReasoning);
          console.log('[Kimi] Successfully parsed reasoning_content as valid JSON');
        }
      } catch {
        console.log('[Kimi] reasoning_content is not valid JSON, using field-level extraction');
      }

      let needsExtraction = false;
      try {
        parseJsonFromResponse(rawContent);
      } catch {
        needsExtraction = true;
      }

      if (!rawContent || needsExtraction) {
        console.log('[Kimi] Attempting field-level extraction from reasoning_content...');
        const extractedFields = extractFieldsFromReasoning(rawContent);
        if (Object.keys(extractedFields).length > 0) {
          console.log(`[Kimi] Extracted ${Object.keys(extractedFields).length} fields from reasoning_content`);
          rawContent = JSON.stringify(extractedFields, null, 2);
          console.log('[Kimi] Rebuilt JSON from extracted fields:', rawContent.substring(0, 300));

          try {
            const rebuiltJson = JSON.parse(rawContent);
            if (typeof rebuiltJson === 'object' && rebuiltJson !== null && 'name' in rebuiltJson) {
              console.log('[Kimi] Rebuilt JSON is valid');
            } else {
              console.log('[Kimi] WARNING: Rebuilt JSON missing name field, using defaults');
            }
          } catch {
            console.error('[Kimi] ERROR: Rebuilt JSON is invalid, clearing rawContent');
            rawContent = '';
          }
        }
      }
    }

    if (!rawContent) {
      res.status(500).json({ error: 'Empty response from AI' });
      return;
    }

    console.log('[Kimi] Raw response preview:', rawContent.substring(0, 500));
    console.log('[Kimi] Parsing JSON...');

    const productData = parseJsonFromResponse(rawContent);

    const product = {
      name: productData.name || 'Produit AI',
      slug: slugify(productData.name || `ai-${Date.now()}`),
      category: productData.category || 'tech',
      images: productData.images || [],
      badge: productData.badge || null,
      badge_color: productData.badge_color || null,
      description: productData.description || 'Description en cours de rédaction.',
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

    if (action === 'analyze') {
      res.status(200).json({ success: true, product });
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      res.status(500).json({ error: 'Supabase credentials not configured' });
      return;
    }

    try {
      const insertedProduct = await insertProduct(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, product);
      res.status(200).json({ success: true, product: insertedProduct });
    } catch (insertError) {
      if (insertError.message && (insertError.message.includes('23505') || insertError.message.includes('duplicate') || insertError.message.includes('unique'))) {
        product.slug = `${product.slug}-${Date.now()}`;
        try {
          const retryProduct = await insertProduct(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, product);
          res.status(200).json({ success: true, product: retryProduct });
        } catch (retryError) {
          res.status(500).json({ error: `Insert failed: ${retryError.message}` });
        }
      } else {
        res.status(500).json({ error: `Insert failed: ${insertError.message}` });
      }
    }
  } catch (err) {
    console.error('[Kimi] Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

module.exports = handler;
