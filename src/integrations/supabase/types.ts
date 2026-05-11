export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          coins: number
          xp: number
          level: number
          inventory: Json
          is_admin: boolean
          is_banned: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          coins?: number
          xp?: number
          level?: number
          inventory?: Json
          is_admin?: boolean
          is_banned?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          coins?: number
          xp?: number
          level?: number
          inventory?: Json
          is_admin?: boolean
          is_banned?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blueprints: {
        Row: {
          id: string
          creator_id: string
          name: string
          track_data: Json
          node_count: number
          closed_loop: boolean
          is_public: boolean
          is_featured: boolean
          best_total_score: number
          survival_rate: number
          adrenaline_score: number
          chaos_score: number
          smoothness_score: number
          creativity_score: number
          likes: number
          downloads: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name?: string
          track_data: Json
          node_count?: number
          closed_loop?: boolean
          is_public?: boolean
          is_featured?: boolean
          best_total_score?: number
          survival_rate?: number
          adrenaline_score?: number
          chaos_score?: number
          smoothness_score?: number
          creativity_score?: number
          likes?: number
          downloads?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          track_data?: Json
          node_count?: number
          closed_loop?: boolean
          is_public?: boolean
          is_featured?: boolean
          best_total_score?: number
          survival_rate?: number
          adrenaline_score?: number
          chaos_score?: number
          smoothness_score?: number
          creativity_score?: number
          likes?: number
          downloads?: number
          created_at?: string
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
      leaderboard_entries: {
        Row: {
          id: string
          user_id: string
          blueprint_id: string | null
          level_id: number | null
          total_score: number
          survival_rate: number
          adrenaline_score: number
          chaos_score: number
          smoothness_score: number
          creativity_score: number
          max_g_force: number
          max_speed_kmh: number
          laps_completed: number
          season: string
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blueprint_id?: string | null
          level_id?: number | null
          total_score: number
          survival_rate?: number
          adrenaline_score?: number
          chaos_score?: number
          smoothness_score?: number
          creativity_score?: number
          max_g_force?: number
          max_speed_kmh?: number
          laps_completed?: number
          season?: string
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blueprint_id?: string | null
          level_id?: number | null
          total_score?: number
          survival_rate?: number
          adrenaline_score?: number
          chaos_score?: number
          smoothness_score?: number
          creativity_score?: number
          max_g_force?: number
          max_speed_kmh?: number
          laps_completed?: number
          season?: string
          submitted_at?: string
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
          id: number
          title: string
          description: string | null
          scenario: string
          order_index: number
          budget: number
          max_nodes: number
          star1_score: number
          star2_score: number
          star3_score: number
          objectives: Json
          reward_coins: number
          reward_xp: number
          starter_track: Json | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          title: string
          description?: string | null
          scenario?: string
          order_index?: number
          budget?: number
          max_nodes?: number
          star1_score?: number
          star2_score?: number
          star3_score?: number
          objectives?: Json
          reward_coins?: number
          reward_xp?: number
          starter_track?: Json | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          title?: string
          description?: string | null
          scenario?: string
          order_index?: number
          budget?: number
          max_nodes?: number
          star1_score?: number
          star2_score?: number
          star3_score?: number
          objectives?: Json
          reward_coins?: number
          reward_xp?: number
          starter_track?: Json | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_with_profiles: {
        Row: {
          id: string | null
          user_id: string | null
          username: string | null
          total_score: number | null
          survival_rate: number | null
          adrenaline_score: number | null
          chaos_score: number | null
          max_g_force: number | null
          max_speed_kmh: number | null
          laps_completed: number | null
          season: string | null
          submitted_at: string | null
          rank: number | null
        }
        Relationships: [
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
