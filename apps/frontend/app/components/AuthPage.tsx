"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "./auth/AuthLayout";
import { AuthForm } from "./auth/AuthForm";

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

  useEffect(() => {
    if (localStorage.getItem("Authorization")) {
      router.push("/room");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex bg-background">
      <AuthLayout />
      <AuthForm isSignin={isSignin} handle={handle} loading={loading} />
    </div>
  );
}
