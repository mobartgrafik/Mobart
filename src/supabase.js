import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vrhrtkjsikutdkmiphbs.supabase.co'
const supabaseKey = 'sb_publishable_dmstXYrdCC-v9UJOdVXFYQ_piq6ThBQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
