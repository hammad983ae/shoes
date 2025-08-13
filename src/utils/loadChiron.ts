// utils/loadChiron.ts
declare global {
  interface Window { ChironPayment?: any }
}

export async function loadChiron(): Promise<void> {
  // Already loaded?
  if (window.ChironPayment) return;

  // If a prior loader is in-flight, wait on it
  const existing = document.querySelector<HTMLScriptElement>('#chiron-sdk');
  if (existing) await whenReady(6000);

  if (!window.ChironPayment) {
    // Try multiple potential URLs for Chiron script
    const urls = [
      'https://payment.chironapp.io/chiron-checkout.js',
      'https://js.chironapp.io/chiron-checkout.js',
      'https://cdn.chironapp.io/chiron-checkout.js'
    ];

    let lastError: Error | null = null;
    
    for (const url of urls) {
      try {
        console.log(`Attempting to load Chiron from: ${url}`);
        
        const s = document.createElement('script');
        s.id = 'chiron-sdk';
        s.src = url;
        s.async = false; // Load synchronously to ensure proper initialization
        s.crossOrigin = 'anonymous';

        const done = new Promise<void>((resolve, reject) => {
          s.onload = () => {
            console.log(`Successfully loaded Chiron script from: ${url}`);
            resolve();
          };
          s.onerror = () => {
            document.head.removeChild(s);
            reject(new Error(`Failed to load from ${url}`));
          };
        });

        document.head.appendChild(s);
        await done;
        await whenReady(3000);
        
        if (window.ChironPayment) {
          console.log('ChironPayment object found and ready');
          return;
        }
        
        // Remove failed script
        document.head.removeChild(s);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load from ${url}:`, error);
      }
    }

    throw new Error(`All Chiron script URLs failed. Last error: ${lastError?.message}. Check network connectivity and verify the correct Chiron script URL.`);
  }
}

function whenReady(timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const started = Date.now();
    const iv = setInterval(() => {
      if (window.ChironPayment) { clearInterval(iv); resolve(); }
      else if (Date.now() - started > timeoutMs) { clearInterval(iv); reject(new Error('Timed out waiting for ChironPayment to initialize.')); }
    }, 50);
  });
}