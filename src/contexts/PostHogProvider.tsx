import { createContext, useContext, useEffect, ReactNode } from 'react';
import posthog from 'posthog-js';

const PostHogContext = createContext<typeof posthog | null>(null);

interface PostHogProviderProps {
  children: ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  useEffect(() => {
    // Initialize PostHog with your project key
    // Replace this with your actual PostHog project API key
    const apiKey = 'phc_9TV6WdEBoDGXoNjFe0cH7u5qigThlmuFas1nVdQWYm4'; // Replace with your actual key
    const host = 'https://us.i.posthog.com';

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        loaded: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded successfully');
          }
        },
      });
      
      // Capture initial page view
      posthog.capture('page_view', { page: window.location.pathname });
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