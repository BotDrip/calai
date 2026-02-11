import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type FoodScan = {
  id: string
  user_id: string
  food_name: string
  image_url?: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  confidence_score: number
  health_score: number
  portion_size?: string
  food_category?: string
  meal_type?: string
  added_to_meal: boolean
  ai_recommendation?: string
  created_at: string
}

export type ScanAnalytics = {
  id: string
  user_id: string
  total_scans: number
  avg_confidence: number
  most_scanned_food?: string
  total_calories_scanned: number
  last_scan_at?: string
  updated_at: string
}

export const foodScanService = {
  async saveScan(userId: string, scanData: Omit<FoodScan, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('food_scans')
      .insert({
        user_id: userId,
        ...scanData,
      })
      .select()
      .single()

    if (error) throw error

    // Update analytics
    await this.updateAnalytics(userId, scanData.food_name, scanData.calories, scanData.confidence_score)

    return data
  },

  async getUserScans(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('food_scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as FoodScan[]
  },

  async getScansByMealType(userId: string, mealType: string) {
    const { data, error } = await supabase
      .from('food_scans')
      .select('*')
      .eq('user_id', userId)
      .eq('meal_type', mealType)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as FoodScan[]
  },

  async updateScanMealStatus(scanId: string, addedToMeal: boolean) {
    const { error } = await supabase
      .from('food_scans')
      .update({ added_to_meal: addedToMeal })
      .eq('id', scanId)

    if (error) throw error
  },

  async getUserAnalytics(userId: string) {
    const { data, error } = await supabase
      .from('scan_analytics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data as ScanAnalytics | null
  },

  async updateAnalytics(userId: string, foodName: string, calories: number, confidence: number) {
    const existing = await this.getUserAnalytics(userId)

    if (existing) {
      const newTotalScans = existing.total_scans + 1
      const newAvgConfidence = ((existing.avg_confidence * existing.total_scans) + confidence) / newTotalScans

      const { error } = await supabase
        .from('scan_analytics')
        .update({
          total_scans: newTotalScans,
          avg_confidence: newAvgConfidence,
          total_calories_scanned: existing.total_calories_scanned + calories,
          last_scan_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('scan_analytics')
        .insert({
          user_id: userId,
          total_scans: 1,
          avg_confidence: confidence,
          most_scanned_food: foodName,
          total_calories_scanned: calories,
          last_scan_at: new Date().toISOString(),
        })

      if (error) throw error
    }
  },

  async getTodayScans(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('food_scans')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as FoodScan[]
  },

  async deleteScan(scanId: string) {
    const { error } = await supabase
      .from('food_scans')
      .delete()
      .eq('id', scanId)

    if (error) throw error
  },
}
