"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Globe, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-finflow-border bg-finflow-bg/80 px-6 backdrop-blur-md">
      <div className="relative flex-1 max-w-xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-finflow-muted"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search transactions..."
          className="h-10 w-full rounded-full border border-finflow-border bg-finflow-search pl-11 pr-4 text-sm text-finflow-text placeholder:text-finflow-muted outline-none transition-colors focus:border-finflow-teal/40 focus:ring-1 focus:ring-finflow-teal/30"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-finflow-muted transition-colors hover:bg-finflow-card hover:text-finflow-text"
          aria-label="Language"
        >
          <Globe className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-finflow-muted transition-colors hover:bg-finflow-card hover:text-finflow-text"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-finflow-teal" />
        </button>
        <div className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-finflow-border">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
