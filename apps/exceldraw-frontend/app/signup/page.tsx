"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { AuthPage } from "../components/AuthPage";

export default function Signup() {

  const router = useRouter();
  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const userData = {
      username: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    };

    try {
      await axios.post(`${HTTP_BACKEND}/signup`, userData);
      router.push("/signin");
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error.message);
    }
  }

  return <AuthPage isSignin={false} handle={handleSignup} />;
}
