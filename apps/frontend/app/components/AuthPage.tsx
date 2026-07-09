"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "./auth/AuthLayout";
import { AuthForm } from "./auth/AuthForm";
import { useAuthStore } from "@/lib/store/authStore";

export function AuthPage({
  isSignin,
  handle,
  loading,
}: {
  isSignin: boolean;
  handle: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}) {
  const router = useRouter();
  const { token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && token) {
      router.push("/room");
    }
  }, [token, isHydrated, router]);

  return (
    <div className="min-h-screen flex bg-background">
      <AuthLayout />
      <AuthForm isSignin={isSignin} handle={handle} loading={loading} />
    </div>
  );
}
