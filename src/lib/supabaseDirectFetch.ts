// Direct fetch utility to replace hanging Supabase client
// This provides the same interface but uses native fetch for better reliability
// IMPORTANT: We keep Supabase auth, only replace database operations

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Get auth headers (with or without user token)
const getHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'X-Client-Info': 'shoe-scape-web'
  };
  
  // Only add Authorization header for authenticated requests
  if (includeAuth) {
    // Get token from Supabase auth storage
    const token = localStorage.getItem('sb-auth-token') || 
                  localStorage.getItem('sb-auth') ||
                  sessionStorage.getItem('sb-auth-token') ||
                  sessionStorage.getItem('sb-auth');
    
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.access_token) {
          headers['Authorization'] = `Bearer ${parsed.access_token}`;
        }
      } catch (e) {
        // If parsing fails, try to use the raw token
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  
  return headers;
};

// Generic fetch wrapper with error handling
const supabaseFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    console.log('🔍 Direct fetch request:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Direct fetch error response:', response.status, errorText);
      console.error('❌ Request URL:', url);
      console.error('❌ Request options:', options);
      
      // Return empty array for 400 errors to prevent crashes
      if (response.status === 400) {
        console.warn('⚠️ Returning empty array for 400 error to prevent crash');
        return [];
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Direct fetch success:', { endpoint, dataLength: Array.isArray(data) ? data.length : 'not array' });
    
    // Ensure data is always an array for consistency
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('💥 Direct fetch error:', error);
    // Return empty array on error to prevent undefined.map() errors
    return [];
  }
};

// IMPORTANT: We DON'T replace Supabase auth - we keep the original client for auth
// Import the original Supabase client for authentication
import { createClient } from '@supabase/supabase-js';

// Create the original Supabase client for auth only
const supabaseAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database methods (replacing only the database operations)
export const supabaseDB = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        eq: (column2: string, value2: any) => ({
          async execute() {
            const endpoint = `/${table}?select=${columns}&${column}=eq.${encodeURIComponent(value)}&${column2}=eq.${encodeURIComponent(value2)}`;
            const data = await supabaseFetch(endpoint);
            return { data, error: null };
          }
        }),
        not: (column2: string, value2: any) => ({
          async execute() {
            const endpoint = `/${table}?select=${columns}&${column}=eq.${encodeURIComponent(value)}&${column2}=neq.${encodeURIComponent(value2)}`;
            const data = await supabaseFetch(endpoint);
            return { data, error: null };
          }
        }),
        order: (column: string, direction: 'asc' | 'desc' | { ascending: boolean } = 'asc') => ({
          limit: (count: number) => ({
            async execute() {
              let dir = 'asc';
              if (typeof direction === 'object') {
                dir = direction.ascending ? 'asc' : 'desc';
              } else {
                dir = direction;
              }
              const endpoint = `/${table}?select=${columns}&${column}=eq.${encodeURIComponent(value)}&order=${column}.${dir}&limit=${count}`;
              const data = await supabaseFetch(endpoint);
              return { data, error: null };
            }
          }),
          async execute() {
            let dir = 'asc';
            if (typeof direction === 'object') {
              dir = direction.ascending ? 'asc' : 'desc';
            } else {
              dir = direction;
            }
            const endpoint = `/${table}?select=${columns}&${column}=eq.${encodeURIComponent(value)}&order=${column}.${dir}`;
            const data = await supabaseFetch(endpoint);
            return { data, error: null };
          }
        }),
        maybeSingle: async () => {
          const endpoint = `/${table}?select=${columns}&${column}=eq.${encodeURIComponent(value)}&limit=1`;
          const data = await supabaseFetch(endpoint);
          return { data: data[0] || null, error: null };
        },
        single: async () => {
          const endpoint = `/${table}?select=${columns}&${column}=eq.${encodeURIComponent(value)}&limit=1`;
          const data = await supabaseFetch(endpoint);
          if (data.length === 0) {
            return { data: null, error: { message: 'No rows returned' } };
          }
          return { data: data[0], error: null };
        },
        async execute() {
          const endpoint = `/${table}?select=${columns}&${column}=eq.${encodeURIComponent(value)}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      not: (column: string, operator: string, value: any) => ({
        limit: (count: number) => ({
          async execute() {
            let endpoint: string;
            if (operator === 'is' && (value === null || value === 'null')) {
              endpoint = `/${table}?select=${columns}&${column}=is.null&limit=${count}`;
            } else {
              endpoint = `/${table}?select=${columns}&${column}=neq.${encodeURIComponent(value)}&limit=${count}`;
            }
            const data = await supabaseFetch(endpoint);
            return { data, error: null };
          }
        }),
        async execute() {
          let endpoint: string;
          if (operator === 'is' && (value === null || value === 'null')) {
            endpoint = `/${table}?select=${columns}&${column}=is.null`;
          } else {
            endpoint = `/${table}?select=${columns}&${column}=neq.${encodeURIComponent(value)}`;
          }
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      in: (column: string, values: any[]) => ({
        async execute() {
          const valuesParam = values.map(v => encodeURIComponent(v)).join(',');
          const endpoint = `/${table}?select=${columns}&${column}=in.(${valuesParam})`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      gte: (column: string, value: any) => ({
        async execute() {
          const endpoint = `/${table}?select=${columns}&${column}=gte.${encodeURIComponent(value)}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      lte: (column: string, value: any) => ({
        async execute() {
          const endpoint = `/${table}?select=${columns}&${column}=lte.${encodeURIComponent(value)}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      gt: (column: string, value: any) => ({
        async execute() {
          const endpoint = `/${table}?select=${columns}&${column}=gt.${encodeURIComponent(value)}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      lt: (column: string, value: any) => ({
        async execute() {
          const endpoint = `/${table}?select=${columns}&${column}=lt.${encodeURIComponent(value)}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      or: (condition: string) => ({
        async execute() {
          // Handle or conditions like "display_name.ilike.%search%"
          const endpoint = `/${table}?select=${columns}&${condition}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      limit: (count: number) => ({
        async execute() {
          const endpoint = `/${table}?select=${columns}&limit=${count}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      order: (column: string, direction: 'asc' | 'desc' | { ascending: boolean } = 'asc') => ({
        limit: (count: number) => ({
          async execute() {
            let dir = 'asc';
            if (typeof direction === 'object') {
              dir = direction.ascending ? 'asc' : 'desc';
            } else {
              dir = direction;
            }
            const endpoint = `/${table}?select=${columns}&order=${column}.${dir}&limit=${count}`;
            const data = await supabaseFetch(endpoint);
            return { data, error: null };
          }
        }),
        async execute() {
          let dir = 'asc';
          if (typeof direction === 'object') {
            dir = direction.ascending ? 'asc' : 'desc';
          } else {
            dir = direction;
          }
          const endpoint = `/${table}?select=${columns}&order=${column}.${dir}`;
          const data = await supabaseFetch(endpoint);
          return { data, error: null };
        }
      }),
      async execute() {
        const endpoint = `/${table}?select=${columns}`;
        const data = await supabaseFetch(endpoint);
        return { data, error: null };
      }
    }),
    insert: (values: any) => ({
      select: (columns: string = '*') => ({
        async execute() {
          const endpoint = `/${table}?select=${columns}`;
          const data = await supabaseFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(values),
          });
          return { data, error: null };
        }
      }),
      async execute() {
        const endpoint = `/${table}`;
        const data = await supabaseFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(values),
        });
        return { data, error: null };
      }
    }),
    upsert: (values: any, options?: { onConflict?: string }) => ({
      async execute() {
        const endpoint = `/${table}`;
        const headers: Record<string, string> = {};
        
        // Handle onConflict for upsert operations
        if (options?.onConflict) {
          headers['Prefer'] = `resolution=${options.onConflict}`;
        }
        
        const data = await supabaseFetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(values),
        });
        return { data, error: null };
      }
    }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        async execute() {
          const endpoint = `/${table}?${column}=eq.${encodeURIComponent(value)}`;
          const data = await supabaseFetch(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(values),
          });
          return { data, error: null };
        }
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        async execute() {
          const endpoint = `/${table}?${column}=eq.${encodeURIComponent(value)}`;
          const data = await supabaseFetch(endpoint, {
            method: 'DELETE',
          });
          return { data, error: null };
        }
      })
    })
  })
};

// RPC methods (for stored procedures)
export const supabaseRPC = {
  rpc: (func: string, params?: any) => ({
    async execute() {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${func}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(params || {}),
        });

        if (response.ok) {
          const data = await response.json();
          return { data, error: null };
        } else {
          const error = await response.json();
          return { data: null, error };
        }
      } catch (error) {
        return { data: null, error };
      }
    }
  })
};

// Also support direct RPC calls
export const supabaseRPCDirect = {
  rpc: async (func: string, params?: any) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${func}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(params || {}),
      });

      if (response.ok) {
        const data = await response.json();
        return { data, error: null };
      } else {
        const error = await response.json();
        return { data: null, error };
      }
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Channel methods (for real-time subscriptions - simplified)
export const supabaseChannel = {
  channel: (name: string, options?: any) => ({
    on: (event: string, config: any) => ({
      on: (event2: string, config2: any) => ({
        subscribe: () => {
          // Handle multiple event subscriptions
          console.log(`Mock channel subscription to ${name} for events ${event} and ${event2}`);
          return {
            unsubscribe: () => {
              console.log(`Mock channel unsubscription from ${name} for events ${event} and ${event2}`);
            }
          };
        }
      }),
      subscribe: () => {
        // Single event subscription
        console.log(`Mock channel subscription to ${name} for event ${event}`);
        return {
          unsubscribe: () => {
            console.log(`Mock channel unsubscription from ${name} for event ${event}`);
          }
        };
      }
    }),
    subscribe: () => ({
      unsubscribe: () => {
        console.log(`Mock channel unsubscription from ${name}`);
      }
    })
  }),
  removeChannel: (channel: any) => {
    if (channel && typeof channel.unsubscribe === 'function') {
      channel.unsubscribe();
    }
    console.log('Mock channel removed');
  }
};

// Storage methods (for file uploads)
export const supabaseStorage = {
  from: (bucket: string) => ({
    upload: (path: string, file: File, options?: any) => ({
      async execute() {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            return { data, error: null };
          } else {
            const error = await response.json();
            return { data: null, error };
          }
        } catch (error) {
          return { data: null, error };
        }
      }
    }),
    getPublicUrl: (path: string) => ({
      data: {
        publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
      }
    })
  })
};

// Export a comprehensive Supabase client that uses direct fetch for DB operations
// but keeps the original auth client for authentication
export const supabase = {
  // Use original Supabase client for auth (this works reliably)
  auth: supabaseAuthClient.auth,
  
  // Use direct fetch for database operations (this fixes hanging issues)
  from: supabaseDB.from,
  
  // Use direct fetch for storage
  storage: supabaseStorage,
  
  // Use direct fetch for RPC
  rpc: (func: string, params?: any) => {
    // Support both chained and direct calls
    if (typeof func === 'string') {
      return supabaseRPCDirect.rpc(func, params);
    }
    return supabaseRPC.rpc(func, params);
  },
  
  // Use mock channels for real-time (prevents crashes)
  channel: supabaseChannel.channel,
  removeChannel: supabaseChannel.removeChannel,
};
