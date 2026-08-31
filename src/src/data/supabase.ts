import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
// ponytail: jangan throw saat import — dev tanpa .env tetap render, sync akan queue
export const supabase = url && key ? createClient(url, key) : createClient("https://placeholder.supabase.co", "placeholder-anon-key")
