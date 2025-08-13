import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ error: "Content-Type must be application/json" }, 415);
    }

    const body = await req.json().catch(() => ({}));
    const rawAmount = body?.amount;

    if (rawAmount === undefined || rawAmount === null || isNaN(Number(rawAmount))) {
      return json({ error: "Invalid or missing amount" }, 400);
    }

    // Match guide: send amount as a string with 2 decimals (e.g. "183.60")
    const amount = Number(rawAmount);
    const amountStr = amount.toFixed(2);

    const TOKEN_URL = Deno.env.get("CHIRON_TOKEN_URL");
    const API_KEY = Deno.env.get("CHIRON_API_KEY");

    if (!TOKEN_URL || !API_KEY) {
      return json({ error: "Server misconfigured: missing CHIRON_TOKEN_URL or CHIRON_API_KEY" }, 500);
    }

    // Call EXACT Chiron endpoint from the guide (no fallbacks, no /v1 guessing)
    const upstream = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ amount: amountStr }),
    });

    const text = await upstream.text();
    // Helpful for debugging status codes while keeping secrets safe:
    console.log("[chiron token] status=", upstream.status, "body=", text.slice(0, 500));

    if (!upstream.ok) {
      return json(
        { error: "Token request failed", status: upstream.status, body: safeJson(text) },
        upstream.status === 404 ? 502 : 502
      );
    }

    const data = safeParse(text);
    if (!data || typeof data.id !== "string" || data.id.length < 6) {
      return json({ error: "Malformed token response", body: data ?? text }, 502);
    }

    return json({ token: data.id, amount: amountStr });
  } catch (err) {
    console.error("create-payment-token error:", err);
    return json({ error: "Server error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
function safeJson(s: string) {
  const p = safeParse(s);
  return p ?? s;
}
