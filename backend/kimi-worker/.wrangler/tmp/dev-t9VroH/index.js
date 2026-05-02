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
var SUPABASE_URL_BASE = "https://bmbeahjvdiglnxfpbzyu.supabase.co";
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
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No JSON found in response");
  }
}
__name(parseJsonFromResponse, "parseJsonFromResponse");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type"
  };
}
__name(corsHeaders, "corsHeaders");
async function supabaseFetch(path, method, body, key) {
  const resp = await fetch(`${SUPABASE_URL_BASE}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...body ? {} : {}
    },
    ...body && { body: JSON.stringify(body) }
  });
  return resp;
}
__name(supabaseFetch, "supabaseFetch");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;
    if (path === "/task" && request.method === "POST") {
      try {
        const { url: productUrl, imageBase64 } = await request.json();
        if (!productUrl && !imageBase64) {
          return new Response(JSON.stringify({ error: "url or imageBase64 required" }), {
            status: 400,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const taskResp = await supabaseFetch("/rest/v1/import_tasks", "POST", {
          url: productUrl || null,
          image_base64: imageBase64 || null,
          status: "queued"
        }, key);
        if (!taskResp.ok) {
          const errBody = await taskResp.text();
          console.error("[Worker] Task creation failed:", errBody);
          return new Response(JSON.stringify({ error: "Failed to create task" }), {
            status: 500,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const task = (await taskResp.json())[0];
        return new Response(JSON.stringify({ task_id: task.id }), {
          status: 200,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("[Worker] Error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      }
    }
    if (path.startsWith("/task/") && request.method === "GET") {
      const taskId = path.split("/")[2];
      if (!taskId) {
        return new Response(JSON.stringify({ error: "task_id required" }), {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      }
      try {
        const resp = await supabaseFetch(`/rest/v1/import_tasks?id=eq.${taskId}&select=*`, "GET", null, key);
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: "Task not found" }), {
            status: 404,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const tasks = await resp.json();
        if (!tasks.length) {
          return new Response(JSON.stringify({ error: "Task not found" }), {
            status: 404,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const task = tasks[0];
        return new Response(JSON.stringify({
          status: task.status,
          result: task.result,
          error: task.error,
          product: task.result?.product || null
        }), {
          status: 200,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("[Worker] Poll error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      }
    }
    if (path === "/cron/process" && request.method === "POST") {
      try {
        const queueResp = await supabaseFetch(
          `/rest/v1/import_tasks?status=eq.queued&order=created_at.asc&limit=1&select=*`,
          "GET",
          null,
          key
        );
        if (!queueResp.ok) {
          return new Response(JSON.stringify({ processed: false }), {
            status: 200,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const queue = await queueResp.json();
        if (!queue.length) {
          return new Response(JSON.stringify({ processed: false }), {
            status: 200,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const task = queue[0];
        console.log("[Worker] Processing task:", task.id);
        await supabaseFetch(`/rest/v1/import_tasks?id=eq.${task.id}`, "PATCH", {
          status: "processing"
        }, key);
        const messages = [{ role: "system", content: SYSTEM_PROMPT }];
        if (task.image_base64) {
          messages.push({
            role: "user",
            content: [
              { type: "image_url", image_url: { url: task.image_base64 } },
              {
                type: "text",
                text: task.url ? `Lien: ${task.url}
Analyse cette image et cherche les infos.` : `Analyse cette image de produit sur les plateformes chinoises.`
              }
            ]
          });
        } else {
          messages.push({
            role: "user",
            content: `Lien: ${task.url}
Analyse ce produit sur les plateformes chinoises.`
          });
        }
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
          const kimiError = await kimiResp.text();
          console.error("[Worker] Kimi error:", kimiResp.status, kimiError);
          await supabaseFetch(`/rest/v1/import_tasks?id=eq.${task.id}`, "PATCH", {
            status: "error",
            error: `Kimi API ${kimiResp.status}: ${kimiError.substring(0, 500)}`
          }, key);
          return new Response(JSON.stringify({ processed: true, status: "error" }), {
            status: 200,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const kimiData = await kimiResp.json();
        const message = kimiData.choices?.[0]?.message;
        const rawContent = message?.content || message?.reasoning_content || "";
        if (!rawContent) {
          await supabaseFetch(`/rest/v1/import_tasks?id=eq.${task.id}`, "PATCH", {
            status: "error",
            error: "Empty response from Kimi"
          }, key);
          return new Response(JSON.stringify({ processed: true, status: "error" }), {
            status: 200,
            headers: { ...corsHeaders(), "Content-Type": "application/json" }
          });
        }
        const productData = parseJsonFromResponse(rawContent);
        const product = {
          name: productData.name || "Produit AI",
          slug: slugify(productData.name || `ai-${Date.now()}`),
          category: productData.category || "tech",
          images: productData.images || [],
          badge: productData.badge || null,
          badge_color: productData.badge_color || null,
          description: productData.description || "Description en cours.",
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
        let insertResp = await supabaseFetch("/rest/v1/products", "POST", product, key);
        if (!insertResp.ok) {
          const errBody = await insertResp.text();
          if (insertResp.status === 409) {
            product.slug = `${product.slug}-${Date.now()}`;
            insertResp = await supabaseFetch("/rest/v1/products", "POST", product, key);
          }
          if (!insertResp.ok) {
            const finalErr = await insertResp.text();
            console.error("[Worker] Insert failed:", finalErr);
            await supabaseFetch(`/rest/v1/import_tasks?id=eq.${task.id}`, "PATCH", {
              status: "error",
              error: `Insert failed: ${finalErr.substring(0, 300)}`
            }, key);
            return new Response(JSON.stringify({ processed: true, status: "error" }), {
              status: 200,
              headers: { ...corsHeaders(), "Content-Type": "application/json" }
            });
          }
        }
        const inserted = await insertResp.json();
        await supabaseFetch(`/rest/v1/import_tasks?id=eq.${task.id}`, "PATCH", {
          status: "completed",
          result: { product: inserted[0] }
        }, key);
        console.log("[Worker] Task completed:", task.id);
        return new Response(JSON.stringify({ processed: true, status: "completed" }), {
          status: 200,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      } catch (err) {
        console.error("[Worker] Cron error:", err.message);
        return new Response(JSON.stringify({ processed: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" }
        });
      }
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders(), "Content-Type": "application/json" }
    });
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
