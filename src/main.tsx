import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Runtime check for environment variables
console.log('🔧 Supabase URL', import.meta.env.VITE_SUPABASE_URL ? 'OK' : 'MISSING');

createRoot(document.getElementById("root")!).render(<App />);
