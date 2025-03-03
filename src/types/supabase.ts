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
          email: string
          created_at: string
          points: number
          preferences: Json
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          points?: number
          preferences?: Json
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category_id: string
          image_url: string
          model_url?: string
          stock: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category_id: string
          image_url: string
          model_url?: string
          stock: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          parent_id?: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          parent_id?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
        }
      }
    }
  }
} 