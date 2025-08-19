import { createContext, useContext, useEffect, ReactNode } from 'react';
import posthog from 'posthog-js';

const PostHogContext = createContext<typeof posthog | null>(null);

interface PostHogProviderProps {
  children: ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  useEffect(() => {
    // Get PostHog API key from environment or use a placeholder for now
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY || 'ph_test_key';
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (apiKey && apiKey !== 'ph_test_key') {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
      });
    }
  }, []);

  return (
    <PostHogContext.Provider value={posthog}>
      {children}
    </PostHogContext.Provider>
  );
};

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  return context;
};