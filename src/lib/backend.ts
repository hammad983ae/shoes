export async function wakeUpBackend(): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wake-up-backend`
  try {
    await fetch(url, {
      method: 'GET',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      // no credentials; we just need the function alive
    })
  } catch {
    // swallow – this is a best-effort ping
  }
}