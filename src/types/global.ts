// Consolidated global types to prevent conflicts
export interface Sneaker {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
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