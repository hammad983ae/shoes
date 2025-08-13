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
    // Inject the script
    const s = document.createElement('script');
    s.id = 'chiron-sdk';
    s.src = 'https://payment.chironapp.io/chiron-checkout.js'; // EXACT URL from your guide
    s.async = true;
    s.crossOrigin = 'anonymous';

    const done = new Promise<void>((resolve, reject) => {
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Chiron script failed to load (network/DNS/blocked).'));
    });

    document.head.appendChild(s);
    await done;
    await whenReady(6000);
  }

  if (!window.ChironPayment) {
    // Give a precise, actionable error instead of "please refresh"
    throw new Error(
      'ChironPayment global not found. Check Network tab for chiron-checkout.js status (must be 200) and Content-Type (must be JavaScript). Also verify CSP allows https://payment.chironapp.io.'
    );
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