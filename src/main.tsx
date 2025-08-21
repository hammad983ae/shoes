import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { performHealthCheck } from './utils/healthCheck'

// Runtime check for environment variables
console.log('🔧 Supabase URL', import.meta.env.VITE_SUPABASE_URL ? 'OK' : 'MISSING');

// 7. Perform health check on app boot in dev mode
performHealthCheck();

createRoot(document.getElementById("root")!).render(<App />);
