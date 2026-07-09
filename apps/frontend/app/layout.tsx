import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "DrawApp - Real-Time Collaborative Whiteboard",
  description: "Draw, collaborate, and create together in real-time. A collaborative whiteboard for teams to sketch, brainstorm, and bring ideas to life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} ${manrope.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
