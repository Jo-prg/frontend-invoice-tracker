// AuthButtonServer.tsx (server component)
import { createClient } from "@/lib/supabase/server";
import { UserMenuClient } from "./user-menu.client";

export async function UserMenuServer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return <UserMenuClient user={user} />;
}
