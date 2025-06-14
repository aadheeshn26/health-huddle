export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          flagged_reason: string | null
          group_id: string | null
          id: string
          is_flagged: boolean | null
          message: string
          moderated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          flagged_reason?: string | null
          group_id?: string | null
          id?: string
          is_flagged?: boolean | null
          message: string
          moderated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          flagged_reason?: string | null
          group_id?: string | null
          id?: string
          is_flagged?: boolean | null
          message?: string
          moderated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_checkups: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      doctor_chats: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          message: string
          sender_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          message: string
          sender_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          message?: string
          sender_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_chats_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          created_at: string
          email: string
          id: string
          location: string | null
          name: string
          phone: string | null
          profile_picture_url: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          location?: string | null
          name: string
          phone?: string | null
          profile_picture_url?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          profile_picture_url?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          condition: Database["public"]["Enums"]["health_condition"] | null
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          condition?: Database["public"]["Enums"]["health_condition"] | null
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          condition?: Database["public"]["Enums"]["health_condition"] | null
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          doctor_email: string
          id: string
          report_url: string | null
          status: string
          time_range: number
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_email: string
          id?: string
          report_url?: string | null
          status?: string
          time_range: number
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_email?: string
          id?: string
          report_url?: string | null
          status?: string
          time_range?: number
          user_id?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          id: string
          last_login: string
          streak_count: number
          user_id: string
        }
        Insert: {
          id?: string
          last_login?: string
          streak_count?: number
          user_id: string
        }
        Update: {
          id?: string
          last_login?: string
          streak_count?: number
          user_id?: string
        }
        Relationships: []
      }
      support_points: {
        Row: {
          id: string
          last_updated: string
          points: number
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          points?: number
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          text: string | null
          user_id: string
          voice_transcript: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          text?: string | null
          user_id: string
          voice_transcript?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          text?: string | null
          user_id?: string
          voice_transcript?: string | null
        }
        Relationships: []
      }
      trends_analysis: {
        Row: {
          analysis_period: number
          claude_patterns: Json | null
          created_at: string
          gpt_summary: string | null
          id: string
          key_metrics: Json | null
          updated_at: string
          user_id: string
          vision_insights: Json | null
        }
        Insert: {
          analysis_period?: number
          claude_patterns?: Json | null
          created_at?: string
          gpt_summary?: string | null
          id?: string
          key_metrics?: Json | null
          updated_at?: string
          user_id: string
          vision_insights?: Json | null
        }
        Update: {
          analysis_period?: number
          claude_patterns?: Json | null
          created_at?: string
          gpt_summary?: string | null
          id?: string
          key_metrics?: Json | null
          updated_at?: string
          user_id?: string
          vision_insights?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_streak: {
        Args: { user_uuid: string }
        Returns: number
      }
    }
    Enums: {
      health_condition:
        | "diabetes"
        | "hypertension"
        | "heart_disease"
        | "asthma"
        | "arthritis"
        | "depression"
        | "anxiety"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      health_condition: [
        "diabetes",
        "hypertension",
        "heart_disease",
        "asthma",
        "arthritis",
        "depression",
        "anxiety",
        "other",
      ],
    },
  },
} as const
