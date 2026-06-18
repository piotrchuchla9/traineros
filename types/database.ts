export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      trainers: {
        Row: {
          id: string
          email: string
          name: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          trial_ends_at: string | null
          subscription_ends_at: string | null
          cancel_at_period_end: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          trial_ends_at?: string | null
          created_at?: string
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          trial_ends_at?: string | null
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          trainer_id: string
          name: string
          email: string | null
          phone: string | null
          goal: string | null
          notes: string | null
          active: boolean
          avatar_url: string | null
          auth_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          name: string
          email?: string | null
          phone?: string | null
          goal?: string | null
          notes?: string | null
          active?: boolean
          avatar_url?: string | null
          auth_user_id?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          goal?: string | null
          notes?: string | null
          active?: boolean
          avatar_url?: string | null
          auth_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clients_trainer_id_fkey'
            columns: ['trainer_id']
            isOneToOne: false
            referencedRelation: 'trainers'
            referencedColumns: ['id']
          }
        ]
      }
      exercises: {
        Row: {
          id: string
          trainer_id: string | null
          name: string
          name_en: string | null
          muscle_group: string
          youtube_url: string | null
          description: string | null
          description_en: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id?: string | null
          name: string
          name_en?: string | null
          muscle_group: string
          youtube_url?: string | null
          description?: string | null
          description_en?: string | null
        }
        Update: {
          name?: string
          name_en?: string | null
          muscle_group?: string
          youtube_url?: string | null
          description?: string | null
          description_en?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          client_id: string
          trainer_id: string
          name: string
          share_token: string
          active: boolean
          weeks: number
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          trainer_id: string
          name: string
          share_token: string
          active?: boolean
          weeks?: number
        }
        Update: {
          name?: string
          active?: boolean
          weeks?: number
        }
        Relationships: [
          {
            foreignKeyName: 'plans_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'plans_trainer_id_fkey'
            columns: ['trainer_id']
            isOneToOne: false
            referencedRelation: 'trainers'
            referencedColumns: ['id']
          }
        ]
      }
      plan_days: {
        Row: {
          id: string
          plan_id: string
          name: string
          day_order: number
        }
        Insert: {
          id?: string
          plan_id: string
          name: string
          day_order: number
        }
        Update: {
          name?: string
          day_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'plan_days_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          }
        ]
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          trial_days: number
          uses: number
          max_uses: number
          active: boolean
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          trial_days?: number
          uses?: number
          max_uses?: number
          active?: boolean
          description?: string | null
        }
        Update: {
          active?: boolean
          uses?: number
          max_uses?: number
          trial_days?: number
          description?: string | null
        }
        Relationships: []
      }
      plan_exercises: {
        Row: {
          id: string
          day_id: string
          exercise_id: string
          sets: number
          reps: string
          rest_seconds: number | null
          notes: string | null
          exercise_order: number
        }
        Insert: {
          id?: string
          day_id: string
          exercise_id: string
          sets: number
          reps: string
          rest_seconds?: number | null
          notes?: string | null
          exercise_order: number
        }
        Update: {
          sets?: number
          reps?: string
          rest_seconds?: number | null
          notes?: string | null
          exercise_order?: number
          day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plan_exercises_day_id_fkey'
            columns: ['day_id']
            isOneToOne: false
            referencedRelation: 'plan_days'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'plan_exercises_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          }
        ]
      }
      progress_entries: {
        Row: {
          id: string
          client_id: string
          trainer_id: string
          date: string
          weight_kg: number | null
          measurements: Json | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          trainer_id: string
          date: string
          weight_kg?: number | null
          measurements?: Json | null
          notes?: string | null
        }
        Update: {
          date?: string
          weight_kg?: number | null
          measurements?: Json | null
          notes?: string | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          id: string
          entry_id: string
          storage_path: string
          photo_order: number
        }
        Insert: {
          id?: string
          entry_id: string
          storage_path: string
          photo_order?: number
        }
        Update: {
          photo_order?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          id: string
          client_id: string
          trainer_id: string
          plan_id: string | null
          plan_name: string | null
          day_name: string | null
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          trainer_id: string
          plan_id?: string | null
          plan_name?: string | null
          day_name?: string | null
          date: string
          notes?: string | null
        }
        Update: {
          date?: string
          notes?: string | null
        }
        Relationships: []
      }
      trainer_locations: {
        Row: { id: string; trainer_id: string; name: string; created_at: string }
        Insert: { id?: string; trainer_id: string; name: string }
        Update: { name?: string }
        Relationships: []
      }
      training_sessions: {
        Row: {
          id: string; trainer_id: string; client_id: string
          date: string; time: string | null; duration_minutes: number
          location_id: string | null; location_name: string | null
          notes: string | null; post_notes: string | null
          paid: boolean; created_at: string
        }
        Insert: {
          id?: string; trainer_id: string; client_id: string
          date: string; time?: string | null; duration_minutes?: number
          location_id?: string | null; location_name?: string | null
          notes?: string | null; post_notes?: string | null; paid?: boolean
        }
        Update: {
          date?: string; time?: string | null; duration_minutes?: number
          location_id?: string | null; location_name?: string | null
          notes?: string | null; post_notes?: string | null; paid?: boolean
          client_id?: string
        }
        Relationships: []
      }
      workout_log_exercises: {
        Row: {
          id: string
          log_id: string
          exercise_name: string
          planned_sets: number | null
          planned_reps: string | null
          actual_weight: string | null
          actual_reps: string | null
          notes: string | null
          exercise_order: number
        }
        Insert: {
          id?: string
          log_id: string
          exercise_name: string
          planned_sets?: number | null
          planned_reps?: string | null
          actual_weight?: string | null
          actual_reps?: string | null
          notes?: string | null
          exercise_order?: number
        }
        Update: {
          actual_weight?: string | null
          actual_reps?: string | null
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Trainer = Database['public']['Tables']['trainers']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type Plan = Database['public']['Tables']['plans']['Row']
export type PlanDay = Database['public']['Tables']['plan_days']['Row']
export type PlanExerciseRow = Database['public']['Tables']['plan_exercises']['Row']

export type PlanExercise = PlanExerciseRow & { exercise: Exercise; day_id: string }

export type PlanDayWithExercises = PlanDay & { exercises: PlanExercise[] }

export type PlanState = Plan & { days: PlanDayWithExercises[] }

export type PromoCode = Database['public']['Tables']['promo_codes']['Row']

export interface TrainerLocation {
  id: string
  trainer_id: string
  name: string
  created_at: string
}

export interface TrainingSession {
  id: string
  trainer_id: string
  client_id: string
  date: string
  time: string | null
  duration_minutes: number
  location_id: string | null
  location_name: string | null
  notes: string | null
  post_notes: string | null
  paid: boolean
  google_event_id?: string | null
  created_at: string
  client?: { id: string; name: string }
  location?: TrainerLocation | null
}

export interface BodyMeasurements {
  chest?: number | null
  waist?: number | null
  hips?: number | null
  bicep?: number | null
  thigh?: number | null
  calf?: number | null
  [key: string]: number | null | undefined
}

export interface ProgressEntry {
  id: string
  client_id: string
  trainer_id: string
  date: string
  weight_kg: number | null
  measurements: BodyMeasurements | null
  notes: string | null
  created_at: string
  photos: ProgressPhoto[]
}

export interface ProgressPhoto {
  id: string
  entry_id: string
  storage_path: string
  photo_order: number
  url?: string
}

export interface WorkoutLog {
  id: string
  client_id: string
  trainer_id: string
  plan_id: string | null
  plan_name: string | null
  day_name: string | null
  date: string
  notes: string | null
  created_at: string
  exercises: WorkoutLogExercise[]
}

export interface WorkoutLogExercise {
  id: string
  log_id: string
  exercise_name: string
  planned_sets: number | null
  planned_reps: string | null
  actual_weight: string | null
  actual_reps: string | null
  notes: string | null
  exercise_order: number
}

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Klatka' },
  { value: 'back', label: 'Plecy' },
  { value: 'legs', label: 'Nogi' },
  { value: 'shoulders', label: 'Barki' },
  { value: 'arms', label: 'Ramiona' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
]
