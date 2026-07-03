import { LucideIcon } from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  isComingSoon?: boolean;
}

export interface TechStackItem {
  name: string;
  category: "Frontend" | "Backend" | "DevOps";
}

export interface WebSocketMessageExample {
  type: string;
  description: string;
  payload: Record<string, any>;
}
