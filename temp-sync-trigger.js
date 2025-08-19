// Temporary file to trigger product sync
fetch('https://uvczawicaqqiyutcqoyg.supabase.co/functions/v1/sync-products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}).then(res => res.json()).then(console.log);