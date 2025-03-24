"use client";  
import { useRouter } from "next/navigation";
import { AuthPage } from "../components/AuthPage";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

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
      
        console.log("Sending data:", userData); 
      
        try {
          const response = await axios.post(`${HTTP_BACKEND}/signup`, userData, {
            headers: { "Content-Type": "application/json" },
          });
          console.log("Signup Success:", response.data);
          router.push("/signin");   
        } catch (error: any) {
          console.error("Signup Error:", error.response?.data || error.message);
        }
      }

  return <AuthPage isSignin={false} handle={handleSignup} />;
}
