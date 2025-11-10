"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { clearGuestMode } from "@/lib/auth/guestMode";
import { clearAllGuestData } from "@/lib/auth/guestStorage";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Clear guest mode data
      clearGuestMode();
      clearAllGuestData();
      document.cookie = "guest_mode=; path=/; max-age=0";

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Force a hard redirect with full page reload
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if there's an error
      window.location.href = "/auth/login";
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
