# Data Persistence Fix

## Problem
When users switched to other tabs (like google.com) and then returned to the Shoe Scape app, all data was lost because the app state was being reset. This included:
- Cart items
- User authentication state
- User profile data
- Favorites
- App navigation state

## Root Cause
The issue was caused by:
1. **No localStorage fallback**: The app relied solely on React context state which gets reset on page reload/remount
2. **Slow session recovery**: Auth context had recovery logic but it was too slow and didn't handle all edge cases
3. **Missing offline persistence**: No service worker or offline caching strategy

## Solution Implemented

### 1. Enhanced AuthContext (`src/contexts/AuthContext.tsx`)
- Added localStorage persistence for session and profile data
- Implemented immediate session recovery on focus/visibility change
- Added page restore event handling for bfcache scenarios
- Faster recovery without debouncing delays

### 2. Enhanced Cart Persistence (`src/hooks/useCartPersistence.ts`)
- Added localStorage fallback for cart items
- Automatic fallback to cached data when database connection fails
- Dual persistence strategy: localStorage + Supabase
- Graceful degradation when offline

### 3. Data Persistence Utility (`src/utils/dataPersistence.ts`)
- Centralized data persistence management
- Automatic data expiration and cleanup
- Version management for future migrations
- Event system for data change notifications

### 4. App State Recovery Hook (`src/hooks/useAppStateRecovery.ts`)
- Monitors app visibility and focus changes
- Automatically saves app state when user leaves
- Recovers app state when user returns
- Periodic state saving for critical data

### 5. Enhanced Service Worker (`public/sw-enhanced.js`)
- Offline caching for static assets
- Network-first strategy for API calls
- Cache-first strategy for static resources
- Background sync capabilities

### 6. Service Worker Registration (`src/utils/serviceWorker.ts`)
- Automatic service worker registration
- Update handling and notifications
- Offline mode detection

## How It Works

### Data Flow
1. **User interacts with app** → Data saved to both React state and localStorage
2. **User switches tabs** → App state automatically saved to localStorage
3. **User returns to app** → App immediately recovers from localStorage
4. **Background sync** → Data synchronized with Supabase when connection restored

### Recovery Scenarios
- **Tab switching**: Immediate recovery from localStorage
- **Page refresh**: Fast recovery from cached auth and cart data
- **Browser back/forward**: State preserved through navigation
- **Offline mode**: App continues working with cached data
- **Connection loss**: Graceful fallback to local storage

## Benefits

1. **No more data loss**: All critical data persists across tab switches
2. **Faster app recovery**: Immediate restoration of user state
3. **Better offline experience**: App works even without internet
4. **Improved performance**: Reduced API calls through intelligent caching
5. **User experience**: Seamless experience when switching between apps

## Technical Details

### Storage Keys Used
- `shoe-scape-auth`: User authentication data
- `shoe-scape-profile`: User profile information
- `shoe-scape-cart`: Shopping cart items
- `favorites`: User favorite items
- `shoe-scape-persisted-data`: General app state

### Event Listeners
- `visibilitychange`: Detect when app becomes visible/hidden
- `focus/blur`: Detect when window gains/loses focus
- `pageshow`: Handle page restoration from bfcache
- `beforeunload`: Save state before page unload

### Caching Strategies
- **Static assets**: Cache-first (CSS, JS, images)
- **API calls**: Network-first with cache fallback
- **Navigation**: Network-first with offline fallback

## Future Enhancements

1. **Background sync**: Sync offline actions when connection restored
2. **Push notifications**: Notify users of app updates
3. **Advanced caching**: Intelligent cache invalidation
4. **Data compression**: Reduce localStorage usage
5. **Migration system**: Handle data format changes

## Testing

To test the fix:
1. Add items to cart
2. Switch to another tab (e.g., google.com)
3. Return to Shoe Scape app
4. Verify cart items are still present
5. Verify user remains logged in
6. Check browser console for recovery logs

## Monitoring

The system logs recovery events to the console:
- `Loaded cart from localStorage: X items`
- `Fallback to localStorage cart: X items`
- `Recovering app state from: [timestamp]`

## Troubleshooting

If data still gets lost:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check if service worker is registered
4. Ensure user is authenticated
5. Check network connectivity
