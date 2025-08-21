// src/lib/backend.ts
export async function wakeUpBackend() {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wake-up-backend`
    await fetch(url, {
      method: "GET",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
        "Content-Type": "application/json",
      },
    })
  } catch (e) {
    console.warn("wakeUpBackend failed", e)
  }
}
