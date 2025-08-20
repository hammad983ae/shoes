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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      checklist_items: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          profile_id: string | null
          text: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          profile_id?: string | null
          text: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          profile_id?: string | null
          text?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credits_history: {
        Row: {
          action: string
          created_at: string
          credits: number
          id: string
          profile_id: string | null
          type: string
        }
        Insert: {
          action: string
          created_at?: string
          credits: number
          id?: string
          profile_id?: string | null
          type?: string
        }
        Update: {
          action?: string
          created_at?: string
          credits?: number
          id?: string
          profile_id?: string | null
          type?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          price_per_item: number
          product_id: string | null
          quantity: number
          size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          price_per_item: number
          product_id?: string | null
          quantity?: number
          size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          price_per_item?: number
          product_id?: string | null
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
          created_at: string
          creator_id: string | null
          id: string
          order_total: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commission_amount_at_purchase?: number | null
          created_at?: string
          creator_id?: string | null
          id?: string
          order_total?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commission_amount_at_purchase?: number | null
          created_at?: string
          creator_id?: string | null
          id?: string
          order_total?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          profile_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          profile_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          profile_id?: string | null
          status?: string
        }
        Relationships: []
      }
      product_media: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          product_id: string | null
          role: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string | null
          role?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string | null
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
      products: {
        Row: {
          availability: string | null
          brand: string | null
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          infinite_stock: boolean | null
          limited: boolean | null
          price: number
          size_type: string | null
          slashed_price: number | null
          slug: string | null
          stock: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          infinite_stock?: boolean | null
          limited?: boolean | null
          price: number
          size_type?: string | null
          slashed_price?: number | null
          slug?: string | null
          stock?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          infinite_stock?: boolean | null
          limited?: boolean | null
          price?: number
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
          avatar_url: string | null
          bio: string | null
          commission_rate: number | null
          coupon_code: string | null
          created_at: string | null
          creator_tier: string | null
          credits: number | null
          display_name: string | null
          is_creator: boolean | null
          last_login_at: string | null
          referrals_count: number | null
          role: string | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          coupon_code?: string | null
          created_at?: string | null
          creator_tier?: string | null
          credits?: number | null
          display_name?: string | null
          is_creator?: boolean | null
          last_login_at?: string | null
          referrals_count?: number | null
          role?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number | null
          coupon_code?: string | null
          created_at?: string | null
          creator_tier?: string | null
          credits?: number | null
          display_name?: string | null
          is_creator?: boolean | null
          last_login_at?: string | null
          referrals_count?: number | null
          role?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string | null
          rating: number
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_metrics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          connected_at: string | null
          created_at: string | null
          follower_count: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          platform: string
          profile_url: string | null
          screenshot_url: string | null
          updated_at: string | null
          user_id: string | null
          username: string
          verified_at: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          platform: string
          profile_url?: string | null
          screenshot_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          verified_at?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          platform?: string
          profile_url?: string | null
          screenshot_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      social_verification_requests: {
        Row: {
          created_at: string
          id: string
          platform: string
          screenshot_url: string | null
          status: string
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          screenshot_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          screenshot_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          comments: number | null
          created_at: string
          id: string
          likes: number | null
          platform: string
          profile_id: string | null
          title: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          id?: string
          likes?: number | null
          platform: string
          profile_id?: string | null
          title: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          id?: string
          likes?: number | null
          platform?: string
          profile_id?: string | null
          title?: string
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
