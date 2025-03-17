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
      users: {
        Row: {
          id: string
          name: string
          age: number
          education?: string
          difficulty: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          education?: string
          difficulty: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          education?: string
          difficulty?: string
          created_at?: string
          updated_at?: string
        }
      }
      game_metrics: {
        Row: {
          id: string
          user_id: string
          game_name: string
          metrics: Json
          completed_at: string
          is_skipped: boolean
        }
        Insert: {
          id?: string
          user_id: string
          game_name: string
          metrics: Json
          completed_at?: string
          is_skipped?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          game_name?: string
          metrics?: Json
          completed_at?: string
          is_skipped?: boolean
        }
      }
      cognitive_reports: {
        Row: {
          id: string
          user_id: string
          overall_score: number
          summary: string
          strengths: Json
          weaknesses: Json
          domain_analyses: Json
          recommendations: Json
          relationship_insights: Json
          learning_styles: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          overall_score: number
          summary: string
          strengths: Json
          weaknesses: Json
          domain_analyses: Json
          recommendations: Json
          relationship_insights: Json
          learning_styles: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          overall_score?: number
          summary?: string
          strengths?: Json
          weaknesses?: Json
          domain_analyses?: Json
          recommendations?: Json
          relationship_insights?: Json
          learning_styles?: Json
          created_at?: string
          updated_at?: string
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