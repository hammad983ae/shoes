export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          clicks: number | null
          conversions: number | null
          created_at: string | null
          id: string
          name: string
          platform: string | null
          revenue: number | null
          roas: number | null
          spend: number | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          name: string
          platform?: string | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          name?: string
          platform?: string | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string
          id: string
          items: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          profile_id: string
          text: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          profile_id: string
          text: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          profile_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          code: string
          created_at: string | null
          creator_id: string
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          max_usage: number | null
          total_used_amount: number | null
          total_uses: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          creator_id: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          total_used_amount?: number | null
          total_uses?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          creator_id?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          total_used_amount?: number | null
          total_uses?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_codes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_code: string
          created_at: string | null
          discount_amount: number
          discount_percentage: number
          id: string
          order_id: string | null
          user_id: string
        }
        Insert: {
          coupon_code: string
          created_at?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          order_id?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: string
          created_at?: string | null
          discount_amount?: number
          discount_percentage?: number
          id?: string
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_credits_ledger: {
        Row: {
          amount_credits: number
          created_at: string
          creator_id: string
          id: string
          notes: string | null
          status: string | null
          type: string
        }
        Insert: {
          amount_credits: number
          created_at?: string
          creator_id: string
          id?: string
          notes?: string | null
          status?: string | null
          type: string
        }
        Update: {
          amount_credits?: number
          created_at?: string
          creator_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          commission_amount: number
          commission_rate_at_purchase: number
          created_at: string
          creator_id: string
          id: string
          order_id: string
          order_total: number
        }
        Insert: {
          commission_amount: number
          commission_rate_at_purchase: number
          created_at?: string
          creator_id: string
          id?: string
          order_id: string
          order_total: number
        }
        Update: {
          commission_amount?: number
          commission_rate_at_purchase?: number
          created_at?: string
          creator_id?: string
          id?: string
          order_id?: string
          order_total?: number
        }
        Relationships: []
      }
      creator_invites: {
        Row: {
          coupon_code: string
          created_at: string | null
          display_name: string | null
          email: string
          followers: number | null
          id: string
          invite_token: string
          notes: string | null
          starting_credits: number | null
          status: string | null
          tier: string | null
          tiktok_username: string | null
          updated_at: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string | null
          display_name?: string | null
          email: string
          followers?: number | null
          id?: string
          invite_token: string
          notes?: string | null
          starting_credits?: number | null
          status?: string | null
          tier?: string | null
          tiktok_username?: string | null
          updated_at?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string | null
          display_name?: string | null
          email?: string
          followers?: number | null
          id?: string
          invite_token?: string
          notes?: string | null
          starting_credits?: number | null
          status?: string | null
          tier?: string | null
          tiktok_username?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      creator_metrics_monthly: {
        Row: {
          aov: number | null
          commission_paid: number | null
          created_at: string
          creator_id: string
          id: string
          ltv: number | null
          month: string
          orders_count: number | null
          revenue: number | null
          tier: string | null
          updated_at: string
        }
        Insert: {
          aov?: number | null
          commission_paid?: number | null
          created_at?: string
          creator_id: string
          id?: string
          ltv?: number | null
          month: string
          orders_count?: number | null
          revenue?: number | null
          tier?: string | null
          updated_at?: string
        }
        Update: {
          aov?: number | null
          commission_paid?: number | null
          created_at?: string
          creator_id?: string
          id?: string
          ltv?: number | null
          month?: string
          orders_count?: number | null
          revenue?: number | null
          tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      creator_monthly_metrics: {
        Row: {
          aov: number | null
          created_at: string | null
          creator_id: string
          customers_acquired: number | null
          id: string
          month: string
          total_commission: number | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
          video_credits_granted: number | null
        }
        Insert: {
          aov?: number | null
          created_at?: string | null
          creator_id: string
          customers_acquired?: number | null
          id?: string
          month: string
          total_commission?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          video_credits_granted?: number | null
        }
        Update: {
          aov?: number | null
          created_at?: string | null
          creator_id?: string
          customers_acquired?: number | null
          id?: string
          month?: string
          total_commission?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          video_credits_granted?: number | null
        }
        Relationships: []
      }
      credits_history: {
        Row: {
          action: string
          created_at: string | null
          credits: number
          date: string | null
          id: string
          profile_id: string
          type: string
        }
        Insert: {
          action: string
          created_at?: string | null
          credits: number
          date?: string | null
          id?: string
          profile_id: string
          type: string
        }
        Update: {
          action?: string
          created_at?: string | null
          credits?: number
          date?: string | null
          id?: string
          profile_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      credits_ledger: {
        Row: {
          admin_id: string | null
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          type: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_acquisition: {
        Row: {
          created_at: string
          creator_id: string
          first_order_date: string
          first_order_user_id: string
          id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          first_order_date: string
          first_order_user_id: string
          id?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          first_order_date?: string
          first_order_user_id?: string
          id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          status: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          status?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          status?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price_per_item: number
          product_id: string
          quantity: number
          size: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_per_item: number
          product_id: string
          quantity?: number
          size?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_per_item?: number
          product_id?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commission_amount_at_purchase: number | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          creator_id: string | null
          credits_used: number | null
          currency: string
          estimated_delivery: string | null
          fulfillment_notes: string | null
          id: string
          order_images: string[] | null
          order_total: number
          payment_method: string | null
          product_details: Json | null
          quality_check_image: string | null
          shipping_address: Json | null
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_amount_at_purchase?: number | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          creator_id?: string | null
          credits_used?: number | null
          currency?: string
          estimated_delivery?: string | null
          fulfillment_notes?: string | null
          id?: string
          order_images?: string[] | null
          order_total: number
          payment_method?: string | null
          product_details?: Json | null
          quality_check_image?: string | null
          shipping_address?: Json | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_amount_at_purchase?: number | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          creator_id?: string | null
          credits_used?: number | null
          currency?: string
          estimated_delivery?: string | null
          fulfillment_notes?: string | null
          id?: string
          order_images?: string[] | null
          order_total?: number
          payment_method?: string | null
          product_details?: Json | null
          quality_check_image?: string | null
          shipping_address?: Json | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string
          card_last_four: string
          created_at: string | null
          id: string
          is_default: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand: string
          card_last_four: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string
          card_last_four?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          method: string
          profile_id: string
          status: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          method: string
          profile_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          method?: string
          profile_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_analytics: {
        Row: {
          created_at: string
          credits_earned: number | null
          id: string
          interaction_type: string
          interaction_value: number | null
          top_post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_earned?: number | null
          id?: string
          interaction_type: string
          interaction_value?: number | null
          top_post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_earned?: number | null
          id?: string
          interaction_type?: string
          interaction_value?: number | null
          top_post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_analytics_top_post_id_fkey"
            columns: ["top_post_id"]
            isOneToOne: false
            referencedRelation: "top_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          post_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          post_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          brand_tags: string[] | null
          caption: string | null
          category_tags: string[] | null
          content: string | null
          created_at: string
          engagement_score: number | null
          id: string
          image_url: string | null
          like_count: number | null
          media_url: string | null
          post_type: string | null
          product_id: string | null
          show_socials: boolean | null
          show_username: boolean | null
          sneaker_tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          brand_tags?: string[] | null
          caption?: string | null
          category_tags?: string[] | null
          content?: string | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          like_count?: number | null
          media_url?: string | null
          post_type?: string | null
          product_id?: string | null
          show_socials?: boolean | null
          show_username?: boolean | null
          sneaker_tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          brand_tags?: string[] | null
          caption?: string | null
          category_tags?: string[] | null
          content?: string | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          like_count?: number | null
          media_url?: string | null
          post_type?: string | null
          product_id?: string | null
          show_socials?: boolean | null
          show_username?: boolean | null
          sneaker_tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      posts_products: {
        Row: {
          created_at: string
          id: string
          post_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          product_id?: string
        }
        Relationships: []
      }
      product_analytics: {
        Row: {
          created_at: string | null
          id: string
          last_purchased_at: string | null
          product_id: string | null
          purchases_count: number | null
          revenue: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_purchased_at?: string | null
          product_id?: string | null
          purchases_count?: number | null
          revenue?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_purchased_at?: string | null
          product_id?: string | null
          purchases_count?: number | null
          revenue?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          product_id: string
          role: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id: string
          role?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string
          role?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          id: string
          product_id: string
          rating: number
          review_images: string[] | null
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          rating: number
          review_images?: string[] | null
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          review_images?: string[] | null
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          availability: string | null
          brand: string
          care_instructions: string | null
          categories: string[] | null
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          filters: Json | null
          id: string
          images: string[] | null
          infinite_stock: boolean | null
          is_limited: boolean | null
          limited: boolean | null
          materials: string | null
          price: number
          price_type: string | null
          shipping_time: string | null
          size_type: string | null
          slashed_price: number | null
          slug: string | null
          stock: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          brand: string
          care_instructions?: string | null
          categories?: string[] | null
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          images?: string[] | null
          infinite_stock?: boolean | null
          is_limited?: boolean | null
          limited?: boolean | null
          materials?: string | null
          price: number
          price_type?: string | null
          shipping_time?: string | null
          size_type?: string | null
          slashed_price?: number | null
          slug?: string | null
          stock?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          brand?: string
          care_instructions?: string | null
          categories?: string[] | null
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          images?: string[] | null
          infinite_stock?: boolean | null
          is_limited?: boolean | null
          limited?: boolean | null
          materials?: string | null
          price?: number
          price_type?: string | null
          shipping_time?: string | null
          size_type?: string | null
          slashed_price?: number | null
          slug?: string | null
          stock?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms: boolean | null
          account_status: string | null
          admin_notes: string | null
          avatar_url: string | null
          bio: string | null
          commission_rate: number | null
          coupon_code: string | null
          created_at: string
          creator_tier: string | null
          credits: number | null
          display_name: string | null
          id: string
          is_creator: boolean
          last_login_at: string | null
          month_revenue_cached: number | null
          month_updated_at: string | null
          referral_code: string | null
          referrals_count: number | null
          referred_by: string | null
          role: string
          tiktok_followers: number | null
          tiktok_username: string | null
          tiktok_verified: boolean | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_terms?: boolean | null
          account_status?: string | null
          admin_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          coupon_code?: string | null
          created_at?: string
          creator_tier?: string | null
          credits?: number | null
          display_name?: string | null
          id?: string
          is_creator?: boolean
          last_login_at?: string | null
          month_revenue_cached?: number | null
          month_updated_at?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          role?: string
          tiktok_followers?: number | null
          tiktok_username?: string | null
          tiktok_verified?: boolean | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_terms?: boolean | null
          account_status?: string | null
          admin_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          coupon_code?: string | null
          created_at?: string
          creator_tier?: string | null
          credits?: number | null
          display_name?: string | null
          id?: string
          is_creator?: boolean
          last_login_at?: string | null
          month_revenue_cached?: number | null
          month_updated_at?: string | null
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          role?: string
          tiktok_followers?: number | null
          tiktok_username?: string | null
          tiktok_verified?: boolean | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_history: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          product_name: string
          purchase_date: string
          purchase_price: number
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          product_name: string
          purchase_date?: string
          purchase_price: number
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          product_name?: string
          purchase_date?: string
          purchase_price?: number
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_earned: number | null
          id: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_earned?: number | null
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_earned?: number | null
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          status?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_analytics: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          metric_type: string
          metric_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          metric_type: string
          metric_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_analytics_realtime: {
        Row: {
          created_at: string | null
          date: string | null
          hour: number | null
          id: string
          metric_type: string
          metric_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          hour?: number | null
          id?: string
          metric_type: string
          metric_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          hour?: number | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_metrics: {
        Row: {
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          key: string
          updated_at?: string
          value: number
        }
        Update: {
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          platform: string
          profile_url: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          platform: string
          profile_url?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          platform?: string
          profile_url?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      top_posts: {
        Row: {
          author_username: string
          comment_count: number | null
          created_at: string
          credits_earned: number | null
          crowlix_user_id: string | null
          description: string | null
          engagement_score: number | null
          id: string
          like_count: number | null
          original_url: string | null
          platform: string
          platform_post_id: string
          posted_at: string | null
          share_count: number | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author_username: string
          comment_count?: number | null
          created_at?: string
          credits_earned?: number | null
          crowlix_user_id?: string | null
          description?: string | null
          engagement_score?: number | null
          id?: string
          like_count?: number | null
          original_url?: string | null
          platform: string
          platform_post_id: string
          posted_at?: string | null
          share_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author_username?: string
          comment_count?: number | null
          created_at?: string
          credits_earned?: number | null
          crowlix_user_id?: string | null
          description?: string | null
          engagement_score?: number | null
          id?: string
          like_count?: number | null
          original_url?: string | null
          platform?: string
          platform_post_id?: string
          posted_at?: string | null
          share_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          creator_id: string | null
          credits_earned: number | null
          credits_spent: number | null
          id: string
          post_id: string | null
          product_details: Json | null
          product_name: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          creator_id?: string | null
          credits_earned?: number | null
          credits_spent?: number | null
          id?: string
          post_id?: string | null
          product_details?: Json | null
          product_name: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string | null
          credits_earned?: number | null
          credits_spent?: number | null
          id?: string
          post_id?: string | null
          product_details?: Json | null
          product_name?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          current_balance: number | null
          earned_from_referrals: number | null
          id: string
          last_video_credit_reset: string | null
          lifetime_video_credits: number | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
          video_credits_this_month: number | null
        }
        Insert: {
          current_balance?: number | null
          earned_from_referrals?: number | null
          id?: string
          last_video_credit_reset?: string | null
          lifetime_video_credits?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
          video_credits_this_month?: number | null
        }
        Update: {
          current_balance?: number | null
          earned_from_referrals?: number | null
          id?: string
          last_video_credit_reset?: string | null
          lifetime_video_credits?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
          video_credits_this_month?: number | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_posts: {
        Row: {
          created_at: string
          credits_earned: number | null
          description: string | null
          engagement_score: number | null
          id: string
          media_type: string | null
          media_url: string | null
          product_id: string | null
          show_socials: boolean | null
          show_username: boolean | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_earned?: number | null
          description?: string | null
          engagement_score?: number | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          product_id?: string | null
          show_socials?: boolean | null
          show_username?: boolean | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_earned?: number | null
          description?: string | null
          engagement_score?: number | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          product_id?: string | null
          show_socials?: boolean | null
          show_username?: boolean | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          privacy_level: string | null
          push_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          privacy_level?: string | null
          push_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          privacy_level?: string | null
          push_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          comments: number | null
          created_at: string | null
          id: string
          likes: number | null
          platform: string
          profile_id: string
          title: string
          url: string | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          platform: string
          profile_id: string
          title: string
          url?: string | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          platform?: string
          profile_id?: string
          title?: string
          url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          credits_added: number
          id: string
          payment_method_id: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credits_added: number
          id?: string
          payment_method_id?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credits_added?: number
          id?: string
          payment_method_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      unified_credits: {
        Row: {
          commission_rate: number | null
          creator_tier: string | null
          current_balance: number | null
          earned_from_referrals: number | null
          is_creator: boolean | null
          lifetime_video_credits: number | null
          total_earned: number | null
          total_spent: number | null
          user_id: string | null
          video_credits_this_month: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_set_coupon_code: {
        Args: { new_code: string; target_user_id: string }
        Returns: Json
      }
      admin_set_creator_status: {
        Args: {
          is_creator_status: boolean
          new_role?: string
          target_user_id: string
        }
        Returns: Json
      }
      calculate_creator_tier: {
        Args: { monthly_revenue: number }
        Returns: {
          commission_rate: number
          tier: string
        }[]
      }
      calculate_creator_tier_by_commission: {
        Args: { monthly_commission: number }
        Returns: {
          commission_rate: number
          tier: string
        }[]
      }
      calculate_creator_tier_by_revenue: {
        Args: { monthly_revenue: number }
        Returns: {
          commission_rate: number
          tier: string
        }[]
      }
      calculate_top_performers: {
        Args: Record<PropertyKey, never>
        Returns: {
          product_id: string
          product_title: string
          revenue: number
          total_sales: number
          units_sold: number
        }[]
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: Json
      }
      demote_from_creator: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never> | { len?: number }
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_profile_is_creator: {
        Args: { _user_id: string }
        Returns: boolean
      }
      get_profile_role: {
        Args: { _user_id: string }
        Returns: string
      }
      grant_user_credits: {
        Args: {
          credit_amount: number
          credit_type?: string
          notes_text?: string
          target_user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      nudge_browsing_now: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      promote_to_creator: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      set_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: boolean
      }
      update_creator_metrics: {
        Args: { creator_user_id: string }
        Returns: undefined
      }
      update_creator_metrics_by_commission: {
        Args: { creator_user_id: string }
        Returns: undefined
      }
      update_creator_metrics_by_revenue: {
        Args: { creator_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
