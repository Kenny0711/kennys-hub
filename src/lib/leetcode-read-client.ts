import { getSupabaseAdminIfConfigured } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase/server';

export async function getLeetcodeReadClient() {
  const adminClient = getSupabaseAdminIfConfigured();
  if (adminClient) return adminClient;

  return createClient();
}
