# Architecture Documentation

## Avatar Upload System

Avatar uploads follow a specific path format to ensure proper Row Level Security (RLS):

```
avatars/{user_id}/avatar-{timestamp}.{ext}
```

- **Path structure**: `{user_id}` is the authenticated user's ID
- **Naming**: `avatar-{timestamp}` ensures unique filenames
- **Storage bucket**: `avatars` (public bucket with RLS policies)
- **RLS policies**: Use `split_part(name, '/', 1) = auth.uid()::text` for access control

### Upload Process

1. Validate user session and authentication
2. Generate unique filename: `avatar-{timestamp}.jpg`
3. Upload to path: `{user_id}/{filename}`
4. Update profile with new avatar URL via direct update (no upsert)

## CORS Configuration

Edge functions include comprehensive CORS headers:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};
```

- OPTIONS requests return early with CORS headers
- All responses include CORS headers
- Supports authentication and content-type headers

## Database Access Patterns

The application uses Supabase JS client for all database operations:

- ✅ **Use**: `supabase.from('table').select()` 
- ❌ **Avoid**: Direct fetch to `/rest/v1/` endpoints
- ✅ **Always**: Await `auth.getSession()` before authenticated requests
- ✅ **RPC**: Use RPC functions for complex operations like referral code generation

### Example: Site Settings

```typescript
// ❌ OLD: Direct fetch
const response = await fetch('/rest/v1/site_settings?key=eq.browsing_now');

// ✅ NEW: Supabase client
const { data } = await supabase
  .from('site_settings')
  .select('value')
  .eq('key', 'browsing_now')
  .single();
```

### Example: Profile Data

```typescript
// ❌ OLD: Direct fetch
const response = await fetch('/rest/v1/profiles?user_id=eq.123');

// ✅ NEW: Supabase client with session
const { data: { session } } = await supabase.auth.getSession();
const { data } = await supabase
  .from('profiles')
  .select('avatar_url, display_name')
  .eq('user_id', session.user.id)
  .single();
```

## Referral System

### Database Schema

- **referred_by**: UUID column referencing auth.users(id)
- **referral_code**: Unique text column for user's referral code

### RPC Functions

- `get_my_referral_code()`: Returns existing code or null (SECURITY DEFINER)
- `generate_my_referral_code()`: Creates 10-char unique code (SECURITY DEFINER)

### Code Generation

- 10-character uppercase strings
- Generated from MD5 hash of random text + timestamp
- Uniqueness enforced by database constraint and retry loop

### Frontend Integration

```typescript
import { useReferralCode } from '@/hooks/useReferralCode';

const { referralCode, generateReferralCode, getOrCreateReferralCode } = useReferralCode();

// Get existing or create new code
const code = await getOrCreateReferralCode();
```

## Health Checks

Development mode includes automatic health checks that run on app boot:

### Checks Performed

1. **Auth Session**: Validates `supabase.auth.getSession()`
2. **Whoami RPC**: Tests `supabase.rpc('whoami')`
3. **Console Logging**: Results logged to browser console
4. **Environment**: Only runs in development

### Implementation

```typescript
// utils/healthCheck.ts
export const performHealthCheck = async () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Check auth session
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('Auth Session:', { hasSession: !!sessionData.session });
  
  // Check whoami RPC
  const { data: whoamiData } = await supabase.rpc('whoami');
  console.log('Whoami RPC:', { userId: whoamiData });
};
```

## Security Considerations

- **Row Level Security**: Enabled on all tables with appropriate policies
- **Storage Policies**: Enforce user-specific access using path-based validation
- **Security Definer Functions**: Used for sensitive operations like referral code generation
- **Input Validation**: Comprehensive validation and error handling throughout
- **Session Validation**: Runtime guards prevent operations without valid authentication