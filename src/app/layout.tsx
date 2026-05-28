import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/layout/QueryProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "FinFlow",
  description: "AI-powered financial operations for German SMEs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
        <body className="min-h-full flex flex-col bg-finflow-bg font-sans text-finflow-text">
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
