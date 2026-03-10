"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { HeartPulse } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.push(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center gap-2 animate-pulse">
        <HeartPulse className="h-8 w-8 text-red-500" />
        <span className="text-xl font-semibold">BP Tracker</span>
      </div>
    </div>
  );
}
