export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      post_analytics: {
        Row: {
          bonus_credits: number | null
          calculated_at: string
          credits_earned: number
          engagement_multiplier: number | null
          id: string
          top_post_id: string
          user_id: string
        }
        Insert: {
          bonus_credits?: number | null
          calculated_at?: string
          credits_earned?: number
          engagement_multiplier?: number | null
          id?: string
          top_post_id: string
          user_id: string
        }
        Update: {
          bonus_credits?: number | null
          calculated_at?: string
          credits_earned?: number
          engagement_multiplier?: number | null
          id?: string
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
      posts: {
        Row: {
          brand_tags: string[] | null
          category_tags: string[] | null
          content: string | null
          created_at: string
          engagement_score: number | null
          id: string
          image_url: string | null
          sneaker_tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_tags?: string[] | null
          category_tags?: string[] | null
          content?: string | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          sneaker_tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_tags?: string[] | null
          category_tags?: string[] | null
          content?: string | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url?: string | null
          sneaker_tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          referral_code: string | null
          referrals_count: number | null
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          referral_code?: string | null
          referrals_count?: number | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
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
      social_connections: {
        Row: {
          access_token: string | null
          connected_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          platform: string
          platform_user_id: string | null
          refresh_token: string | null
          user_id: string
          username: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          platform: string
          platform_user_id?: string | null
          refresh_token?: string | null
          user_id: string
          username: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          platform?: string
          platform_user_id?: string | null
          refresh_token?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      top_posts: {
        Row: {
          author_platform_id: string | null
          author_username: string
          comment_count: number | null
          credits_earned: number | null
          crowlix_user_id: string | null
          description: string | null
          engagement_score: number | null
          hashtags: string[] | null
          id: string
          imported_at: string
          last_updated_at: string
          like_count: number | null
          original_url: string
          platform: string
          platform_post_id: string
          posted_at: string
          share_count: number | null
          tag_mentions: string[] | null
          thumbnail_url: string | null
          title: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author_platform_id?: string | null
          author_username: string
          comment_count?: number | null
          credits_earned?: number | null
          crowlix_user_id?: string | null
          description?: string | null
          engagement_score?: number | null
          hashtags?: string[] | null
          id?: string
          imported_at?: string
          last_updated_at?: string
          like_count?: number | null
          original_url: string
          platform: string
          platform_post_id: string
          posted_at: string
          share_count?: number | null
          tag_mentions?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author_platform_id?: string | null
          author_username?: string
          comment_count?: number | null
          credits_earned?: number | null
          crowlix_user_id?: string | null
          description?: string | null
          engagement_score?: number | null
          hashtags?: string[] | null
          id?: string
          imported_at?: string
          last_updated_at?: string
          like_count?: number | null
          original_url?: string
          platform?: string
          platform_post_id?: string
          posted_at?: string
          share_count?: number | null
          tag_mentions?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
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
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_balance?: number | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_balance?: number | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
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
      user_settings: {
        Row: {
          created_at: string
          id: string
          notifications_credits: boolean | null
          notifications_email: boolean | null
          notifications_push: boolean | null
          notifications_social_mentions: boolean | null
          privacy_analytics_visible: boolean | null
          privacy_posts_visible: boolean | null
          privacy_profile_visible: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications_credits?: boolean | null
          notifications_email?: boolean | null
          notifications_push?: boolean | null
          notifications_social_mentions?: boolean | null
          privacy_analytics_visible?: boolean | null
          privacy_posts_visible?: boolean | null
          privacy_profile_visible?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications_credits?: boolean | null
          notifications_email?: boolean | null
          notifications_push?: boolean | null
          notifications_social_mentions?: boolean | null
          privacy_analytics_visible?: boolean | null
          privacy_posts_visible?: boolean | null
          privacy_profile_visible?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
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
