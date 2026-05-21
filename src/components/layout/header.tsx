"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, Globe } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [lang, setLang] = useState<"DE" | "EN">("DE");

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button (would trigger a mobile sidebar state in a real implementation) */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
        onClick={() => {}}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Language Toggle (UI only) */}
          <button
            onClick={() => setLang(lang === "DE" ? "EN" : "DE")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>{lang}</span>
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200"
            aria-hidden="true"
          />

          {/* User Profile */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
