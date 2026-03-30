export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      athletes: {
        Row: {
          altura_rack_bp: string
          altura_rack_sq: string
          apellido: string
          cat_peso: number
          categoria: string
          club: string
          created_at: string | null
          genero: Database["public"]["Enums"]["genero_type"]
          id: string
          nombre: string
        }
        Insert: {
          altura_rack_bp?: string
          altura_rack_sq?: string
          apellido: string
          cat_peso?: number
          categoria?: string
          club?: string
          created_at?: string | null
          genero?: Database["public"]["Enums"]["genero_type"]
          id?: string
          nombre: string
        }
        Update: {
          altura_rack_bp?: string
          altura_rack_sq?: string
          apellido?: string
          cat_peso?: number
          categoria?: string
          club?: string
          created_at?: string | null
          genero?: Database["public"]["Enums"]["genero_type"]
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          athlete_id: string
          attempt_number: number
          created_at: string | null
          id: string
          movement: Database["public"]["Enums"]["movement_type"]
          status: Database["public"]["Enums"]["attempt_status"]
          weight: number
        }
        Insert: {
          athlete_id: string
          attempt_number: number
          created_at?: string | null
          id?: string
          movement: Database["public"]["Enums"]["movement_type"]
          status?: Database["public"]["Enums"]["attempt_status"]
          weight?: number
        }
        Update: {
          athlete_id?: string
          attempt_number?: number
          created_at?: string | null
          id?: string
          movement?: Database["public"]["Enums"]["movement_type"]
          status?: Database["public"]["Enums"]["attempt_status"]
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "attempts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_state: {
        Row: {
          athlete_id: string | null
          current_attempt: number | null
          current_movement: Database["public"]["Enums"]["movement_type"] | null
          current_weight: number | null
          id: number
          is_live: boolean
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          current_attempt?: number | null
          current_movement?: Database["public"]["Enums"]["movement_type"] | null
          current_weight?: number | null
          id?: number
          is_live?: boolean
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          current_attempt?: number | null
          current_movement?: Database["public"]["Enums"]["movement_type"] | null
          current_weight?: number | null
          id?: number
          is_live?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_state_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attempt_status: "PENDING" | "CURRENT" | "GOOD" | "BAD"
      genero_type: "M" | "F"
      movement_type: "SQ" | "BP" | "DL"
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
    Enums: {
      attempt_status: ["PENDING", "CURRENT", "GOOD", "BAD"],
      genero_type: ["M", "F"],
      movement_type: ["SQ", "BP", "DL"],
    },
  },
} as const
