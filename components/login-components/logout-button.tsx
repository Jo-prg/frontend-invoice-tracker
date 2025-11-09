"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    if (!mounted) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <Button disabled>Logout</Button>;
  }

  return (
    <Button onClick={logout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
