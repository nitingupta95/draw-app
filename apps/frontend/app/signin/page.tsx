"use client";
import { AuthPage } from "../components/AuthPage";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useState } from "react";

export default function Signin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const userData = {
      username: formData.get("email"),
      password: formData.get("password"),
    };

    console.log("Sending data:", userData);

    try {
      const response = await axios.post(`${HTTP_BACKEND}/signin`, userData, {
        headers: { "Content-Type": "application/json" },
      });

      const token = response.data?.token;

      if (token) {

        localStorage.setItem("Authorization", token);

        console.log("Token saved:", token);

        router.push("/room");
      } else {
        console.warn("No token or user data received!");
      }
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error.message);
    }
    finally {
    setLoading(false); 
  }
  }

  return <AuthPage isSignin={true} handle={handleSignup} loading={loading}></AuthPage>;
}