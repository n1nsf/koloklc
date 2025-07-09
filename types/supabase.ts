export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          name: string
          city: string
          country: string
          description: string
          image_url: string
          facts: string[]
          model_url: string | null
          created_at: string
          featured: boolean
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          name: string
          city: string
          country: string
          description: string
          image_url: string
          facts?: string[]
          model_url?: string | null
          created_at?: string
          featured?: boolean
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          name?: string
          city?: string
          country?: string
          description?: string
          image_url?: string
          facts?: string[]
          model_url?: string | null
          created_at?: string
          featured?: boolean
          latitude?: number | null
          longitude?: number | null
        }
      }
      missions: {
        Row: {
          id: string
          title: string
          description: string
          location_id: string
          points: number
          created_at: string
          active: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          location_id: string
          points?: number
          created_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location_id?: string
          points?: number
          created_at?: string
          active?: boolean
        }
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          location_id: string
          mission_id: string
          created_at: string
          points_earned: number
        }
        Insert: {
          id?: string
          user_id: string
          location_id: string
          mission_id: string
          created_at?: string
          points_earned?: number
        }
        Update: {
          id?: string
          user_id?: string
          location_id?: string
          mission_id?: string
          created_at?: string
          points_earned?: number
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          location_id: null
          points_earned: number
          created_at: string
          certificate_url: string | null
          is_master: true
        }
        Insert: {
          id?: string
          user_id: string
          location_id?: null
          points_earned: number
          created_at?: string
          certificate_url?: string | null
          is_master?: true
        }
        Update: {
          id?: string
          user_id?: string
          location_id?: null
          points_earned?: number
          created_at?: string
          certificate_url?: string | null
          is_master?: true
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          body?: string
          created_at?: string
        }
      }
      location_recommendations: {
        Row: {
          id: string
          source_location_id: string
          recommended_location_id: string
          priority: number
          reason: string | null
          created_at: string
          active: boolean
        }
        Insert: {
          id?: string
          source_location_id: string
          recommended_location_id: string
          priority?: number
          reason?: string | null
          created_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          source_location_id?: string
          recommended_location_id?: string
          priority?: number
          reason?: string | null
          created_at?: string
          active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_check_in: {
        Args: {
          p_location_id: string
          p_mission_id: string
        }
        Returns: {
          id: string
          user_id: string
          location_id: string
          mission_id: string
          created_at: string
          points_earned: number
        }
      }
      generate_certificate: {
        Args: {
          p_user_id: string
          p_points_earned: number
        }
        Returns: {
          id: string
          user_id: string
          location_id: null
          points_earned: number
          created_at: string
          certificate_url: string | null
          is_master: true
        }
      }
      send_certificate_email: {
        Args: {
          p_user_id: string
          p_certificate_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}