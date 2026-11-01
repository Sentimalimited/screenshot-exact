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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          body: string
          created_at: string
          excerpt: string
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          admin_notes: string | null
          attachment_path: string | null
          consent: boolean
          contact_name: string
          county: string | null
          created_at: string
          details: string
          email: string
          id: string
          kind: string
          location: string | null
          organisation: string | null
          phone: string | null
          preferred_date: string | null
          quantity: number | null
          service: string | null
          status: string
          timeframe: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachment_path?: string | null
          consent?: boolean
          contact_name: string
          county?: string | null
          created_at?: string
          details?: string
          email: string
          id?: string
          kind: string
          location?: string | null
          organisation?: string | null
          phone?: string | null
          preferred_date?: string | null
          quantity?: number | null
          service?: string | null
          status?: string
          timeframe?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachment_path?: string | null
          consent?: boolean
          contact_name?: string
          county?: string | null
          created_at?: string
          details?: string
          email?: string
          id?: string
          kind?: string
          location?: string | null
          organisation?: string | null
          phone?: string | null
          preferred_date?: string | null
          quantity?: number | null
          service?: string | null
          status?: string
          timeframe?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          published: boolean
          question: string
          show_on_home: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          question: string
          show_on_home?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          show_on_home?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          alt_text: string
          caption: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          caption?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          caption?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_items: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          price_label: string | null
          published: boolean
          requires_quote: boolean
          service_slug: string | null
          sort_order: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          price_label?: string | null
          published?: boolean
          requires_quote?: boolean
          service_slug?: string | null
          sort_order?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          price_label?: string | null
          published?: boolean
          requires_quote?: boolean
          service_slug?: string | null
          sort_order?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          audience: string
          benefits: string[]
          created_at: string
          cta_label: string
          how_to_request: string
          id: string
          image_alt: string | null
          image_url: string | null
          involves: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          benefits?: string[]
          created_at?: string
          cta_label?: string
          how_to_request?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          involves?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          benefits?: string[]
          created_at?: string
          cta_label?: string
          how_to_request?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          involves?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          brochure_url: string | null
          company_name: string
          company_name_approved: boolean
          email: string | null
          ga_measurement_id: string | null
          id: number
          intro: string
          mission: string
          mpesa_instructions: string | null
          office_hours: string | null
          phone: string | null
          privacy_approved: boolean
          public_address: string | null
          search_console_token: string | null
          tagline: string
          tagline_approved: boolean
          updated_at: string
          vision: string
          whatsapp: string | null
          whatsapp_confirmed: boolean
        }
        Insert: {
          brochure_url?: string | null
          company_name?: string
          company_name_approved?: boolean
          email?: string | null
          ga_measurement_id?: string | null
          id?: number
          intro?: string
          mission?: string
          mpesa_instructions?: string | null
          office_hours?: string | null
          phone?: string | null
          privacy_approved?: boolean
          public_address?: string | null
          search_console_token?: string | null
          tagline?: string
          tagline_approved?: boolean
          updated_at?: string
          vision?: string
          whatsapp?: string | null
          whatsapp_confirmed?: boolean
        }
        Update: {
          brochure_url?: string | null
          company_name?: string
          company_name_approved?: boolean
          email?: string | null
          ga_measurement_id?: string | null
          id?: number
          intro?: string
          mission?: string
          mpesa_instructions?: string | null
          office_hours?: string | null
          phone?: string | null
          privacy_approved?: boolean
          public_address?: string | null
          search_console_token?: string | null
          tagline?: string
          tagline_approved?: boolean
          updated_at?: string
          vision?: string
          whatsapp?: string | null
          whatsapp_confirmed?: boolean
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          created_at: string
          id: string
          organisation: string | null
          permission_confirmed: boolean
          published: boolean
          quote: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          created_at?: string
          id?: string
          organisation?: string | null
          permission_confirmed?: boolean
          published?: boolean
          quote: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          created_at?: string
          id?: string
          organisation?: string | null
          permission_confirmed?: boolean
          published?: boolean
          quote?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
