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
          brand: 'NVIDIA' | 'AMD' | 'Intel'
          model: string
          price: number
          category: 'Gaming' | 'Workstation' | 'Mining' | 'AI'
          image: string | null
          description: string | null
          specs: {
            memory: string
            memoryType: string
            coreClock: string
            boostClock: string
            tdp: string
          }
          stock: number
          rating: number
          reviews: number
          badge: 'NEW' | 'SALE' | 'LIMITED' | 'BEST SELLER' | null
          sale: {
            active: boolean
            percentage: number
            oldPrice: number
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: 'NVIDIA' | 'AMD' | 'Intel'
          model: string
          price: number
          category: 'Gaming' | 'Workstation' | 'Mining' | 'AI'
          image?: string | null
          description?: string | null
          specs: {
            memory: string
            memoryType: string
            coreClock: string
            boostClock: string
            tdp: string
          }
          stock: number
          rating: number
          reviews: number
          badge?: 'NEW' | 'SALE' | 'LIMITED' | 'BEST SELLER' | null
          sale?: {
            active: boolean
            percentage: number
            oldPrice: number
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: 'NVIDIA' | 'AMD' | 'Intel'
          model?: string
          price?: number
          category?: 'Gaming' | 'Workstation' | 'Mining' | 'AI'
          image?: string | null
          description?: string | null
          specs?: {
            memory: string
            memoryType: string
            coreClock: string
            boostClock: string
            tdp: string
          }
          stock?: number
          rating?: number
          reviews?: number
          badge?: 'NEW' | 'SALE' | 'LIMITED' | 'BEST SELLER' | null
          sale?: {
            active: boolean
            percentage: number
            oldPrice: number
          } | null
          created_at?: string
          updated_at?: string
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
          product_name: string
          price: number
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          product_name: string
          price: number
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          product_name?: string
          price?: number
          quantity?: number
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
      gpu_brand: 'NVIDIA' | 'AMD' | 'Intel'
      gpu_category: 'Gaming' | 'Workstation' | 'Mining' | 'AI'
      badge_type: 'NEW' | 'SALE' | 'LIMITED' | 'BEST SELLER'
    }
  }
} 