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
      listings: {
        Row: {
          ac: string | null
          address: string | null
          area_description: string | null
          atm: string | null
          auto_cost: number | null
          available_from: string | null
          breakfast_menu: string | null
          breakfast_time: string | null
          college: string
          college_walk_times: Json | null
          colleges: string[] | null
          cook_available: boolean
          cook_cost: string | null
          created_at: string
          curfew: string | null
          deposit: number | null
          dinner_menu: string | null
          dinner_time: string | null
          electricity: string | null
          electricity_cost: string | null
          enquiries: number
          flat_type: string | null
          food_type: string | null
          gender: string | null
          gym_distance: string | null
          gym_name: string | null
          gym_price: number | null
          has_double: boolean
          has_single: boolean
          has_triple: boolean
          hospital: string | null
          id: string
          ideal_sharers: number | null
          is_featured: boolean
          jogging_spot: string | null
          laundry: string | null
          laundry_cost: string | null
          locality: string
          lunch_menu: string | null
          lunch_time: string | null
          maid_available: boolean
          maid_cost: string | null
          market: string | null
          metro_fare: number | null
          metro_station: string | null
          metro_walk_min: number | null
          name: string
          negotiable: string | null
          notice_period: string | null
          owner_alternate_phone: string | null
          owner_email: string | null
          owner_id: string | null
          owner_name: string | null
          owner_whatsapp: string | null
          per_person_2: number | null
          per_person_3: number | null
          per_person_4: number | null
          pharmacy: string | null
          photos: string[] | null
          price_double: number | null
          price_single: number | null
          price_triple: number | null
          security: string[] | null
          security_score: number | null
          status: string
          total_rent: number | null
          type: string | null
          updated_at: string
          views: number
          walk_min: number | null
          water: string | null
          water_cost: string | null
          wifi: string | null
          wifi_cost: string | null
        }
        Insert: {
          ac?: string | null
          address?: string | null
          area_description?: string | null
          atm?: string | null
          auto_cost?: number | null
          available_from?: string | null
          breakfast_menu?: string | null
          breakfast_time?: string | null
          college: string
          college_walk_times?: Json | null
          colleges?: string[] | null
          cook_available?: boolean
          cook_cost?: string | null
          created_at?: string
          curfew?: string | null
          deposit?: number | null
          dinner_menu?: string | null
          dinner_time?: string | null
          electricity?: string | null
          electricity_cost?: string | null
          enquiries?: number
          flat_type?: string | null
          food_type?: string | null
          gender?: string | null
          gym_distance?: string | null
          gym_name?: string | null
          gym_price?: number | null
          has_double?: boolean
          has_single?: boolean
          has_triple?: boolean
          hospital?: string | null
          id?: string
          ideal_sharers?: number | null
          is_featured?: boolean
          jogging_spot?: string | null
          laundry?: string | null
          laundry_cost?: string | null
          locality: string
          lunch_menu?: string | null
          lunch_time?: string | null
          maid_available?: boolean
          maid_cost?: string | null
          market?: string | null
          metro_fare?: number | null
          metro_station?: string | null
          metro_walk_min?: number | null
          name: string
          negotiable?: string | null
          notice_period?: string | null
          owner_alternate_phone?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_whatsapp?: string | null
          per_person_2?: number | null
          per_person_3?: number | null
          per_person_4?: number | null
          pharmacy?: string | null
          photos?: string[] | null
          price_double?: number | null
          price_single?: number | null
          price_triple?: number | null
          security?: string[] | null
          security_score?: number | null
          status?: string
          total_rent?: number | null
          type?: string | null
          updated_at?: string
          views?: number
          walk_min?: number | null
          water?: string | null
          water_cost?: string | null
          wifi?: string | null
          wifi_cost?: string | null
        }
        Update: {
          ac?: string | null
          address?: string | null
          area_description?: string | null
          atm?: string | null
          auto_cost?: number | null
          available_from?: string | null
          breakfast_menu?: string | null
          breakfast_time?: string | null
          college?: string
          college_walk_times?: Json | null
          colleges?: string[] | null
          cook_available?: boolean
          cook_cost?: string | null
          created_at?: string
          curfew?: string | null
          deposit?: number | null
          dinner_menu?: string | null
          dinner_time?: string | null
          electricity?: string | null
          electricity_cost?: string | null
          enquiries?: number
          flat_type?: string | null
          food_type?: string | null
          gender?: string | null
          gym_distance?: string | null
          gym_name?: string | null
          gym_price?: number | null
          has_double?: boolean
          has_single?: boolean
          has_triple?: boolean
          hospital?: string | null
          id?: string
          ideal_sharers?: number | null
          is_featured?: boolean
          jogging_spot?: string | null
          laundry?: string | null
          laundry_cost?: string | null
          locality?: string
          lunch_menu?: string | null
          lunch_time?: string | null
          maid_available?: boolean
          maid_cost?: string | null
          market?: string | null
          metro_fare?: number | null
          metro_station?: string | null
          metro_walk_min?: number | null
          name?: string
          negotiable?: string | null
          notice_period?: string | null
          owner_alternate_phone?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_whatsapp?: string | null
          per_person_2?: number | null
          per_person_3?: number | null
          per_person_4?: number | null
          pharmacy?: string | null
          photos?: string[] | null
          price_double?: number | null
          price_single?: number | null
          price_triple?: number | null
          security?: string[] | null
          security_score?: number | null
          status?: string
          total_rent?: number | null
          type?: string | null
          updated_at?: string
          views?: number
          walk_min?: number | null
          water?: string | null
          water_cost?: string | null
          wifi?: string | null
          wifi_cost?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pg_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      pg_owners: {
        Row: {
          alternate_phone: string | null
          created_at: string
          email: string
          id: string
          is_verified: boolean
          name: string
          status: string
          total_listings: number
          updated_at: string
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          alternate_phone?: string | null
          created_at?: string
          email: string
          id?: string
          is_verified?: boolean
          name: string
          status?: string
          total_listings?: number
          updated_at?: string
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          alternate_phone?: string | null
          created_at?: string
          email?: string
          id?: string
          is_verified?: boolean
          name?: string
          status?: string
          total_listings?: number
          updated_at?: string
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      roommate_profiles: {
        Row: {
          about_me: string | null
          budget_max: number | null
          budget_min: number | null
          college: string
          course: string | null
          created_at: string
          gender_preference: string | null
          id: string
          move_in_date: string | null
          name: string
          preferred_area: string | null
          status: string
          whatsapp: string
          year: string | null
        }
        Insert: {
          about_me?: string | null
          budget_max?: number | null
          budget_min?: number | null
          college: string
          course?: string | null
          created_at?: string
          gender_preference?: string | null
          id?: string
          move_in_date?: string | null
          name: string
          preferred_area?: string | null
          status?: string
          whatsapp: string
          year?: string | null
        }
        Update: {
          about_me?: string | null
          budget_max?: number | null
          budget_min?: number | null
          college?: string
          course?: string | null
          created_at?: string
          gender_preference?: string | null
          id?: string
          move_in_date?: string | null
          name?: string
          preferred_area?: string | null
          status?: string
          whatsapp?: string
          year?: string | null
        }
        Relationships: []
      }
      student_interests: {
        Row: {
          budget: string | null
          college: string | null
          created_at: string
          gender_preference: string | null
          id: string
          listing_id: string | null
          move_in_date: string | null
          name: string | null
          whatsapp: string | null
          year: string | null
        }
        Insert: {
          budget?: string | null
          college?: string | null
          created_at?: string
          gender_preference?: string | null
          id?: string
          listing_id?: string | null
          move_in_date?: string | null
          name?: string | null
          whatsapp?: string | null
          year?: string | null
        }
        Update: {
          budget?: string | null
          college?: string | null
          created_at?: string
          gender_preference?: string | null
          id?: string
          listing_id?: string | null
          move_in_date?: string | null
          name?: string | null
          whatsapp?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_interests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "owner" | "user"
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
      app_role: ["admin", "owner", "user"],
    },
  },
} as const
