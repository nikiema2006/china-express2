var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-15mH6j/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/index.js
var KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";
var SYSTEM_PROMPT = `Tu es un expert en e-commerce et import-export Chine-Afrique. Ta mission est d'analyser un produit depuis les plateformes chinoises et de generer toutes les donnees necessaires pour le catalogue "China Express" \u2014 un marketplace d'import-export de Shenzhen vers le Burkina Faso.

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
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").trim().substring(0, 80);
}
__name(slugify, "slugify");
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
    throw new Error("No JSON found in response");
  }
}
__name(parseJsonFromResponse, "parseJsonFromResponse");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type"
  };
}
__name(corsHeaders, "corsHeaders");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    try {
      const { url, imageBase64 } = await request.json();
      if (!url && !imageBase64) {
        return new Response(JSON.stringify({ error: "url or imageBase64 is required" }), {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      }
      const messages = [{ role: "system", content: SYSTEM_PROMPT }];
      if (imageBase64) {
        messages.push({
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageBase64 } },
            {
              type: "text",
              text: url ? `Lien du produit: ${url}
Analyse cette image et cherche les infos sur les plateformes chinoises.` : `Analyse cette image de produit et cherche les informations sur les plateformes chinoises (Taobao, Pinduoduo, 1688, Alibaba, etc.).`
            }
          ]
        });
      } else {
        messages.push({
          role: "user",
          content: `Lien du produit: ${url}
Analyse ce produit en faisant une recherche sur les plateformes chinoises et retourne les donnees pour le catalogue.`
        });
      }
      console.log("[Worker] Calling Kimi K2.6...");
      const kimiResp = await fetch(KIMI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.KIMI_API_KEY}`
        },
        body: JSON.stringify({
          model: "kimi-k2.6",
          messages,
          temperature: 1,
          max_tokens: 4096
        })
      });
      if (!kimiResp.ok) {
        const kimiErrorBody = await kimiResp.text();
        console.error("[Worker] Kimi API error:", kimiResp.status, kimiErrorBody);
        return new Response(
          JSON.stringify({ error: `Kimi API error ${kimiResp.status}: ${kimiErrorBody.substring(0, 200)}` }),
          { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        );
      }
      const kimiData = await kimiResp.json();
      const message = kimiData.choices?.[0]?.message;
      const rawContent = message?.content || message?.reasoning_content || "";
      if (!rawContent) {
        console.error("[Worker] Empty response from Kimi:", JSON.stringify(kimiData).substring(0, 500));
        return new Response(
          JSON.stringify({ error: "Empty response from Kimi AI" }),
          { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        );
      }
      console.log("[Worker] Kimi response received, parsing JSON...");
      const productData = parseJsonFromResponse(rawContent);
      const product = {
        name: productData.name || "Produit AI",
        slug: slugify(productData.name || `ai-${Date.now()}`),
        category: productData.category || "tech",
        images: productData.images || [],
        badge: productData.badge || null,
        badge_color: productData.badge_color || null,
        description: productData.description || "Description en cours de redaction.",
        retail_price: productData.retail_price || 5e3,
        wholesale_price: productData.wholesale_price || 3e3,
        min_retail: productData.min_retail || 1,
        min_wholesale: productData.min_wholesale || 10,
        suggested_sell_price: productData.suggested_sell_price || 8e3,
        weight_kg: productData.weight_kg || 0.5,
        dimensions: productData.dimensions || "10x50x40",
        rating: productData.rating || 4,
        reviews: productData.reviews || 0,
        trending: productData.trending || false,
        status: "draft"
      };
      console.log("[Worker] Inserting product into Supabase...");
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
      const insertResp = await fetch(`${supabaseUrl}/rest/v1/products`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(product)
      });
      if (!insertResp.ok) {
        const errorBody = await insertResp.text();
        if (insertResp.status === 409) {
          product.slug = `${product.slug}-${Date.now()}`;
          const retryResp = await fetch(`${supabaseUrl}/rest/v1/products`, {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation"
            },
            body: JSON.stringify(product)
          });
          if (!retryResp.ok) {
            const retryError = await retryResp.text();
            console.error("[Worker] Insert retry failed:", retryError);
            return new Response(
              JSON.stringify({ error: `Insert failed: ${retryError.substring(0, 200)}` }),
              { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
            );
          }
          const retryData = await retryResp.json();
          console.log("[Worker] Product imported successfully (retry)");
          return new Response(
            JSON.stringify({ success: true, product: retryData[0] }),
            { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
          );
        }
        console.error("[Worker] Insert failed:", errorBody);
        return new Response(
          JSON.stringify({ error: `Insert failed: ${errorBody.substring(0, 200)}` }),
          { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        );
      }
      const insertedData = await insertResp.json();
      console.log("[Worker] Product imported successfully:", insertedData[0]?.name);
      return new Response(
        JSON.stringify({ success: true, product: insertedData[0] }),
        { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("[Worker] Unhandled error:", err.message);
      return new Response(
        JSON.stringify({ error: err.message || "Internal server error" }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }
  }
};

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-15mH6j/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-15mH6j/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
