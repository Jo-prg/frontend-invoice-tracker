"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JwtPayload } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface Props {
  user: JwtPayload | undefined
}

function getFirstLetter(email: string) {
  if (typeof email !== 'string' || email.length === 0) {
    return email; // Handle empty strings or non-string inputs
  }
  return email.charAt(0).toUpperCase();
}

export function UserMenuClient({ user }: Props) {
  return user ? (
    <div className="flex items-center space-x-2">
      <Avatar className="relative flex size-8 shrink-0 overflow-hidden rounded-full w-8 h-8">
        <AvatarImage src="/placeholder.svg?height=32&width=32" />
        <AvatarFallback className="bg-muted flex size-full items-center justify-center rounded-full">
          {getFirstLetter(user.email)}
        </AvatarFallback>
      </Avatar>
      <div className="text-sm">
        <div className="text-gray-500">{user.email}</div>
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
