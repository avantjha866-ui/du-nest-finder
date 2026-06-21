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
          area_description: string | null
          atm: string | null
          auto_cost: number | null
          breakfast_menu: string | null
          breakfast_time: string | null
          college: string | null
          cook_cost: string | null
          created_at: string
          curfew: string | null
          deposit: number | null
          dinner_menu: string | null
          dinner_time: string | null
          electricity: string | null
          electricity_cost: string | null
          food_type: string | null
          gender: string | null
          gym_distance: string | null
          gym_name: string | null
          gym_price: number | null
          hospital: string | null
          id: string
          jogging: string | null
          laundry: string | null
          laundry_cost: string | null
          locality: string | null
          lunch_menu: string | null
          lunch_time: string | null
          maid_cost: string | null
          market: string | null
          metro_fare: number | null
          metro_station: string | null
          metro_walk_min: number | null
          name: string | null
          negotiable: string | null
          notes: string | null
          owner_name: string | null
          pharmacy: string | null
          phone2: string | null
          rent: number | null
          security: string[] | null
          sharers: number | null
          status: string
          type: string | null
          walk_min: number | null
          water: string | null
          whatsapp: string | null
          wifi: string | null
        }
        Insert: {
          ac?: string | null
          area_description?: string | null
          atm?: string | null
          auto_cost?: number | null
          breakfast_menu?: string | null
          breakfast_time?: string | null
          college?: string | null
          cook_cost?: string | null
          created_at?: string
          curfew?: string | null
          deposit?: number | null
          dinner_menu?: string | null
          dinner_time?: string | null
          electricity?: string | null
          electricity_cost?: string | null
          food_type?: string | null
          gender?: string | null
          gym_distance?: string | null
          gym_name?: string | null
          gym_price?: number | null
          hospital?: string | null
          id?: string
          jogging?: string | null
          laundry?: string | null
          laundry_cost?: string | null
          locality?: string | null
          lunch_menu?: string | null
          lunch_time?: string | null
          maid_cost?: string | null
          market?: string | null
          metro_fare?: number | null
          metro_station?: string | null
          metro_walk_min?: number | null
          name?: string | null
          negotiable?: string | null
          notes?: string | null
          owner_name?: string | null
          pharmacy?: string | null
          phone2?: string | null
          rent?: number | null
          security?: string[] | null
          sharers?: number | null
          status?: string
          type?: string | null
          walk_min?: number | null
          water?: string | null
          whatsapp?: string | null
          wifi?: string | null
        }
        Update: {
          ac?: string | null
          area_description?: string | null
          atm?: string | null
          auto_cost?: number | null
          breakfast_menu?: string | null
          breakfast_time?: string | null
          college?: string | null
          cook_cost?: string | null
          created_at?: string
          curfew?: string | null
          deposit?: number | null
          dinner_menu?: string | null
          dinner_time?: string | null
          electricity?: string | null
          electricity_cost?: string | null
          food_type?: string | null
          gender?: string | null
          gym_distance?: string | null
          gym_name?: string | null
          gym_price?: number | null
          hospital?: string | null
          id?: string
          jogging?: string | null
          laundry?: string | null
          laundry_cost?: string | null
          locality?: string | null
          lunch_menu?: string | null
          lunch_time?: string | null
          maid_cost?: string | null
          market?: string | null
          metro_fare?: number | null
          metro_station?: string | null
          metro_walk_min?: number | null
          name?: string | null
          negotiable?: string | null
          notes?: string | null
          owner_name?: string | null
          pharmacy?: string | null
          phone2?: string | null
          rent?: number | null
          security?: string[] | null
          sharers?: number | null
          status?: string
          type?: string | null
          walk_min?: number | null
          water?: string | null
          whatsapp?: string | null
          wifi?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      approved_listings_public: {
        Row: {
          ac: string | null
          area_description: string | null
          atm: string | null
          auto_cost: number | null
          breakfast_menu: string | null
          breakfast_time: string | null
          college: string | null
          cook_cost: string | null
          created_at: string | null
          curfew: string | null
          deposit: number | null
          dinner_menu: string | null
          dinner_time: string | null
          electricity: string | null
          electricity_cost: string | null
          food_type: string | null
          gender: string | null
          gym_distance: string | null
          gym_name: string | null
          gym_price: number | null
          hospital: string | null
          id: string | null
          jogging: string | null
          laundry: string | null
          laundry_cost: string | null
          locality: string | null
          lunch_menu: string | null
          lunch_time: string | null
          maid_cost: string | null
          market: string | null
          metro_fare: number | null
          metro_station: string | null
          metro_walk_min: number | null
          name: string | null
          negotiable: string | null
          notes: string | null
          pharmacy: string | null
          rent: number | null
          security: string[] | null
          sharers: number | null
          status: string | null
          type: string | null
          walk_min: number | null
          water: string | null
          wifi: string | null
        }
        Insert: {
          ac?: string | null
          area_description?: string | null
          atm?: string | null
          auto_cost?: number | null
          breakfast_menu?: string | null
          breakfast_time?: string | null
          college?: string | null
          cook_cost?: string | null
          created_at?: string | null
          curfew?: string | null
          deposit?: number | null
          dinner_menu?: string | null
          dinner_time?: string | null
          electricity?: string | null
          electricity_cost?: string | null
          food_type?: string | null
          gender?: string | null
          gym_distance?: string | null
          gym_name?: string | null
          gym_price?: number | null
          hospital?: string | null
          id?: string | null
          jogging?: string | null
          laundry?: string | null
          laundry_cost?: string | null
          locality?: string | null
          lunch_menu?: string | null
          lunch_time?: string | null
          maid_cost?: string | null
          market?: string | null
          metro_fare?: number | null
          metro_station?: string | null
          metro_walk_min?: number | null
          name?: string | null
          negotiable?: string | null
          notes?: string | null
          pharmacy?: string | null
          rent?: number | null
          security?: string[] | null
          sharers?: number | null
          status?: string | null
          type?: string | null
          walk_min?: number | null
          water?: string | null
          wifi?: string | null
        }
        Update: {
          ac?: string | null
          area_description?: string | null
          atm?: string | null
          auto_cost?: number | null
          breakfast_menu?: string | null
          breakfast_time?: string | null
          college?: string | null
          cook_cost?: string | null
          created_at?: string | null
          curfew?: string | null
          deposit?: number | null
          dinner_menu?: string | null
          dinner_time?: string | null
          electricity?: string | null
          electricity_cost?: string | null
          food_type?: string | null
          gender?: string | null
          gym_distance?: string | null
          gym_name?: string | null
          gym_price?: number | null
          hospital?: string | null
          id?: string | null
          jogging?: string | null
          laundry?: string | null
          laundry_cost?: string | null
          locality?: string | null
          lunch_menu?: string | null
          lunch_time?: string | null
          maid_cost?: string | null
          market?: string | null
          metro_fare?: number | null
          metro_station?: string | null
          metro_walk_min?: number | null
          name?: string | null
          negotiable?: string | null
          notes?: string | null
          pharmacy?: string | null
          rent?: number | null
          security?: string[] | null
          sharers?: number | null
          status?: string | null
          type?: string | null
          walk_min?: number | null
          water?: string | null
          wifi?: string | null
        }
        Relationships: []
      }
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
