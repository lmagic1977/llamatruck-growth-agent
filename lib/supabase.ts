import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Data will not persist.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface DbGroup {
  id: string
  group_name: string
  url: string | null
  member_count: number
  last_activity: string | null
  description: string | null
  is_agriculture: boolean
  has_trading: boolean
  status: 'new' | 'contacted' | 'posted'
  created_at: string
}

export interface DbAdmin {
  id: string
  name: string
  profile_url: string | null
  role: 'admin' | 'moderator' | 'member'
  group_id: string | null
  group_name: string | null
  contacted: boolean
  created_at: string
}

export interface DbOutreach {
  id: string
  admin_id: string | null
  admin_name: string | null
  group_name: string | null
  message_type: string | null
  message_content: string | null
  status: 'pending' | 'sent' | 'replied' | 'failed'
  created_at: string
}

// Groups
export async function getGroups(): Promise<DbGroup[]> {
  if (!supabaseUrl) return []
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function addGroup(group: {
  group_name: string
  url?: string
  member_count: number
  last_activity?: string
  description?: string
  is_agriculture?: boolean
  has_trading?: boolean
}): Promise<DbGroup | null> {
  if (!supabaseUrl) return null
  const { data, error } = await supabase
    .from('groups')
    .insert([{
      group_name: group.group_name,
      url: group.url || null,
      member_count: group.member_count,
      last_activity: group.last_activity || null,
      description: group.description || null,
      is_agriculture: group.is_agriculture || false,
      has_trading: group.has_trading || false,
      status: 'new',
    }])
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateGroupStatus(id: string, status: string): Promise<void> {
  if (!supabaseUrl) return
  await supabase.from('groups').update({ status }).eq('id', id)
}

// Admins
export async function getAdmins(): Promise<DbAdmin[]> {
  if (!supabaseUrl) return []
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function addAdmin(admin: {
  name: string
  profile_url?: string
  role?: string
  group_id?: string
  group_name?: string
}): Promise<DbAdmin | null> {
  if (!supabaseUrl) return null
  const { data, error } = await supabase
    .from('admins')
    .insert([{
      name: admin.name,
      profile_url: admin.profile_url || null,
      role: (admin.role as any) || 'member',
      group_id: admin.group_id || null,
      group_name: admin.group_name || null,
      contacted: false,
    }])
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function markAdminContacted(id: string): Promise<void> {
  if (!supabaseUrl) return
  await supabase.from('admins').update({ contacted: true }).eq('id', id)
}

// Outreach
export async function getOutreachLogs(): Promise<DbOutreach[]> {
  if (!supabaseUrl) return []
  const { data, error } = await supabase
    .from('outreach')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function addOutreachLog(log: {
  admin_id?: string
  admin_name?: string
  group_name?: string
  message_type?: string
  message_content?: string
  status?: string
}): Promise<DbOutreach | null> {
  if (!supabaseUrl) return null
  const { data, error } = await supabase
    .from('outreach')
    .insert([{
      admin_id: log.admin_id || null,
      admin_name: log.admin_name || null,
      group_name: log.group_name || null,
      message_type: log.message_type || null,
      message_content: log.message_content || null,
      status: (log.status as any) || 'pending',
    }])
    .select()
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function updateOutreachStatus(id: string, status: string): Promise<void> {
  if (!supabaseUrl) return
  await supabase.from('outreach').update({ status }).eq('id', id)
}
