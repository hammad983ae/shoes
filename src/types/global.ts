// Consolidated global types to prevent conflicts

// Core Profile type for authentication and user data
export interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'creator' | 'admin' | null;
  is_creator: boolean;
  credits: number;
}

export interface Sneaker {
  id: number | string;
  slug?: string; // Add slug field for SEO-friendly URLs
  name: string;
  price: string;
  originalPrice?: string;
  slashed_price?: number;
  image?: string; // Made optional since we use images array
  images: string[];
  brand: string;
  size?: string | { eu: string; us: string; };
  description?: string;
  tags?: string[];
  inStock?: boolean;
  category: string;
  rating?: number;
  reviews?: number;
  sizing?: string;
  stock?: string;
  shipping?: string;
  materials?: string;
  care?: string;
  authenticity?: string;
  quality?: string;
  productDescription?: string;
  productFeatures?: string[];
  productIncludes?: string[];
  keywords?: string[];
  colors?: string[];
  type?: string;
  availability?: string;
  is_limited?: boolean;
  infinite_stock?: boolean;
}

export interface SocialConnection {
  id: string;
  platform: string;
  username: string;
  profile_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  connected_at?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}