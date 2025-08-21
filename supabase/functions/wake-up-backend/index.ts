import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://crallux-sells-web-app.lovable.app",
  "https://preview--crallux-sells-web-app.lovable.app",
  "https://id-preview--d2fdf7d0-d8c0-4349-908f-30599ceb6725.lovable.app",
  "https://d2fdf7d0-d8c0-4349-908f-30599ceb6725.lovableproject.com",
  // add prod if you have it:
  // "https://www.cralluxsells.com",
];

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const headers = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  return new Response(
    JSON.stringify({ ok: true, status: "healthy", ts: new Date().toISOString() }),
    { headers: { ...headers, "Content-Type": "application/json" }, status: 200 },
  );
});
