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
  }
}