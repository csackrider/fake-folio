import { createClient, isSupabaseConfigured } from './client'
import type { Entry, BudgetCategory, AppSettings, HouseholdMember } from '@/lib/types'

// ============ ENTRIES ============

export async function getEntries(): Promise<Entry[]> {
  if (!isSupabaseConfigured()) return []
  
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching entries:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    merchant: row.name,
    amount: Number(row.amount),
    type: row.type as 'income' | 'expense',
    category: row.category,
    date: row.date,
    recurrence: row.is_recurring ? (row.frequency || 'monthly') : 'none',
    assignedTo: row.assigned_to,
  } as Entry))
}

export async function saveEntry(entry: Entry): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('entries')
    .upsert({
      id: entry.id,
      user_id: user.id,
      name: entry.merchant,
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      date: entry.date,
      is_recurring: entry.recurrence !== 'none',
      frequency: entry.recurrence === 'none' ? null : entry.recurrence,
      assigned_to: entry.assignedTo,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error saving entry:', error)
    return false
  }

  return true
}

export async function deleteEntry(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting entry:', error)
    return false
  }

  return true
}

export async function saveAllEntries(entries: Entry[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Delete all existing entries and insert new ones
  const { error: deleteError } = await supabase
    .from('entries')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('Error clearing entries:', deleteError)
    return false
  }

  if (entries.length === 0) return true

  const { error: insertError } = await supabase
    .from('entries')
    .insert(entries.map(entry => ({
      id: entry.id,
      user_id: user.id,
      name: entry.merchant,
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      date: entry.date,
      is_recurring: entry.recurrence !== 'none',
      frequency: entry.recurrence === 'none' ? null : entry.recurrence,
      assigned_to: entry.assignedTo,
    })))

  if (insertError) {
    console.error('Error saving entries:', insertError)
    return false
  }

  return true
}

// ============ BUDGET CATEGORIES ============

export async function getBudgetCategories(): Promise<BudgetCategory[]> {
  if (!isSupabaseConfigured()) return []
  
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching budget categories:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    allocated: Number(row.budget_limit),
    isEssential: true,
    color: row.icon || 'gray',
  }))
}

export async function saveBudgetCategory(category: BudgetCategory): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('budget_categories')
    .upsert({
      id: category.id,
      user_id: user.id,
      name: category.name,
      budget_limit: category.allocated,
      icon: category.color,
    })

  if (error) {
    console.error('Error saving budget category:', error)
    return false
  }

  return true
}

export async function deleteBudgetCategory(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('budget_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting budget category:', error)
    return false
  }

  return true
}

export async function saveAllBudgetCategories(categories: BudgetCategory[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Delete all existing and insert new ones
  const { error: deleteError } = await supabase
    .from('budget_categories')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('Error clearing budget categories:', deleteError)
    return false
  }

  if (categories.length === 0) return true

  const { error: insertError } = await supabase
    .from('budget_categories')
    .insert(categories.map(cat => ({
      id: cat.id,
      user_id: user.id,
      name: cat.name,
      budget_limit: cat.allocated,
      icon: cat.color,
    })))

  if (insertError) {
    console.error('Error saving budget categories:', insertError)
    return false
  }

  return true
}

// ============ SETTINGS ============

export async function getSettings(): Promise<AppSettings | null> {
  if (!isSupabaseConfigured()) return null
  
  const supabase = createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error)
    return null
  }

  if (!data) {
    return null
  }

  return {
    currency: data.currency,
    theme: data.theme as 'light' | 'dark' | 'system',
    members: data.members as HouseholdMember[],
  }
}

export async function saveSettings(settings: AppSettings): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      currency: settings.currency,
      theme: settings.theme,
      members: settings.members,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Error saving settings:', error)
    return false
  }

  return true
}

// ============ CHECK CLOUD MODE ============

export async function checkCloudMode(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  
  const supabase = createClient()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}
