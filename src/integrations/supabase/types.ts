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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blueprint_likes: {
        Row: {
          blueprint_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          blueprint_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          blueprint_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_likes_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprints: {
        Row: {
          adrenaline_score: number
          best_total_score: number
          chaos_score: number
          closed_loop: boolean
          created_at: string
          creativity_score: number
          creator_id: string
          downloads: number
          id: string
          is_featured: boolean
          is_public: boolean
          likes: number
          name: string
          node_count: number
          smoothness_score: number
          survival_rate: number
          track_data: Json
          updated_at: string
        }
        Insert: {
          adrenaline_score?: number
          best_total_score?: number
          chaos_score?: number
          closed_loop?: boolean
          created_at?: string
          creativity_score?: number
          creator_id: string
          downloads?: number
          id?: string
          is_featured?: boolean
          is_public?: boolean
          likes?: number
          name?: string
          node_count?: number
          smoothness_score?: number
          survival_rate?: number
          track_data: Json
          updated_at?: string
        }
        Update: {
          adrenaline_score?: number
          best_total_score?: number
          chaos_score?: number
          closed_loop?: boolean
          created_at?: string
          creativity_score?: number
          creator_id?: string
          downloads?: number
          id?: string
          is_featured?: boolean
          is_public?: boolean
          likes?: number
          name?: string
          node_count?: number
          smoothness_score?: number
          survival_rate?: number
          track_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprints_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_picks: {
        Row: {
          blueprint_id: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          title: string
        }
        Insert: {
          blueprint_id: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          title?: string
        }
        Update: {
          blueprint_id?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_picks_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_picks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_progress: {
        Row: {
          best_score: number
          created_at: string
          last_scores: Json | null
          last_track: Json | null
          max_g: number
          max_speed: number
          runs: number
          scenario: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number
          created_at?: string
          last_scores?: Json | null
          last_track?: Json | null
          max_g?: number
          max_speed?: number
          runs?: number
          scenario?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number
          created_at?: string
          last_scores?: Json | null
          last_track?: Json | null
          max_g?: number
          max_speed?: number
          runs?: number
          scenario?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          adrenaline_score: number
          blueprint_id: string | null
          chaos_score: number
          creativity_score: number
          id: string
          laps_completed: number
          level_id: number | null
          max_g_force: number
          max_speed_kmh: number
          season: string
          smoothness_score: number
          submitted_at: string
          survival_rate: number
          total_score: number
          user_id: string
        }
        Insert: {
          adrenaline_score?: number
          blueprint_id?: string | null
          chaos_score?: number
          creativity_score?: number
          id?: string
          laps_completed?: number
          level_id?: number | null
          max_g_force?: number
          max_speed_kmh?: number
          season?: string
          smoothness_score?: number
          submitted_at?: string
          survival_rate?: number
          total_score: number
          user_id: string
        }
        Update: {
          adrenaline_score?: number
          blueprint_id?: string | null
          chaos_score?: number
          creativity_score?: number
          id?: string
          laps_completed?: number
          level_id?: number | null
          max_g_force?: number
          max_speed_kmh?: number
          season?: string
          smoothness_score?: number
          submitted_at?: string
          survival_rate?: number
          total_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          budget: number
          created_at: string
          description: string | null
          id: number
          is_published: boolean
          max_nodes: number
          objectives: Json
          order_index: number
          reward_coins: number
          reward_xp: number
          scenario: string
          star1_score: number
          star2_score: number
          star3_score: number
          starter_track: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number
          created_at?: string
          description?: string | null
          id?: never
          is_published?: boolean
          max_nodes?: number
          objectives?: Json
          order_index?: number
          reward_coins?: number
          reward_xp?: number
          scenario?: string
          star1_score?: number
          star2_score?: number
          star3_score?: number
          starter_track?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number
          created_at?: string
          description?: string | null
          id?: never
          is_published?: boolean
          max_nodes?: number
          objectives?: Json
          order_index?: number
          reward_coins?: number
          reward_xp?: number
          scenario?: string
          star1_score?: number
          star2_score?: number
          star3_score?: number
          starter_track?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coins: number
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          inventory: Json
          is_admin: boolean
          is_banned: boolean
          level: number
          updated_at: string
          username: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          inventory?: Json
          is_admin?: boolean
          is_banned?: boolean
          level?: number
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          inventory?: Json
          is_admin?: boolean
          is_banned?: boolean
          level?: number
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_with_profiles: {
        Row: {
          adrenaline_score: number | null
          avatar_url: string | null
          blueprint_id: string | null
          chaos_score: number | null
          creativity_score: number | null
          id: string | null
          laps_completed: number | null
          level_id: number | null
          max_g_force: number | null
          max_speed_kmh: number | null
          rank: number | null
          season: string | null
          smoothness_score: number | null
          submitted_at: string | null
          survival_rate: number | null
          total_score: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      award_run_rewards: {
        Args: { p_crashed: boolean; p_stars: number; p_user_id: string }
        Returns: Json
      }
      purchase_shop_item: {
        Args: { p_item_cost: number; p_item_id: string }
        Returns: Json
      }
      record_run: {
        Args: {
          p_max_g: number
          p_max_speed: number
          p_scenario: string
          p_scores: Json
          p_total: number
          p_track: Json
        }
        Returns: {
          best_score: number
          created_at: string
          last_scores: Json | null
          last_track: Json | null
          max_g: number
          max_speed: number
          runs: number
          scenario: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "game_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_score: {
        Args: {
          p_adrenaline: number
          p_blueprint_id: string
          p_chaos: number
          p_creativity: number
          p_laps: number
          p_level_id: number
          p_max_g: number
          p_max_speed_kmh: number
          p_season?: string
          p_smoothness: number
          p_survival: number
        }
        Returns: Json
      }
      toggle_blueprint_like: { Args: { p_blueprint_id: string }; Returns: Json }
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
