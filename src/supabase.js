import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vrhrtkjsikutdkmiphbs.supabase.co'
const supabaseKey = 'TU_WKLEJ_PUBLISHABLE_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
