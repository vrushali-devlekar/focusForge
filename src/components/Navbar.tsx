"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FlameIcon } from "@/components/FlameIcon";
import {
  Crown,
  Palette,
  Timer,
  LogOut,
  LogIn,
} from "lucide-react";

interface NavbarProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  } | null;
  onOpenThemeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user: propUser,
  onOpenThemeModal,
}) => {
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = propUser !== undefined ? propUser : session?.user;

  const userInitial = user?.name
    ? user.name.trim()[0].toUpperCase()
    : user?.email
    ? user.email.trim()[0].toUpperCase()
    : "F";

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.email?.toLowerCase().trim() === "vdevlekar81@gmail.com";

  return (
    <header className="w-full px-4 sm:px-6 pt-3 sm:pt-4 sticky top-0 z-50 pointer-events-none">
      <div className="w-full max-w-2xl sm:max-w-3xl mx-auto rounded-full bg-zinc-900/85 backdrop-blur-md text-zinc-100 px-4 sm:px-6 py-2.5 shadow-lg flex items-center justify-between pointer-events-auto transition-all border border-zinc-800/90">
        {/* 1. Left side: Circular logo with animated living flame + FocusForge */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group select-none flex-shrink-0">
          <FlameIcon size="sm" containerVariant="navbar" />
          <span className="font-bold text-xs sm:text-sm tracking-tight text-zinc-100 group-hover:text-white transition-colors">
            FocusForge
          </span>
        </Link>

        {/* 2. Center links: Stopwatch, Themes, Admin */}
        <nav className="flex items-center gap-1.5 sm:gap-4 text-xs font-medium text-zinc-400">
          {/* Stopwatch Link */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
              pathname === "/dashboard"
                ? "text-zinc-100 font-semibold bg-zinc-800/80"
                : "hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-zinc-400" />
            <span>Stopwatch</span>
          </Link>

          {/* Themes */}
          <button
            type="button"
            onClick={onOpenThemeModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
            title="Theme Settings"
          >
            <Palette className="w-3.5 h-3.5 text-[#42e425]" style={{ color: "var(--accent-primary, #42e425)" }} />
            <span>Themes</span>
          </button>

          {/* Admin Link */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${
                pathname === "/admin"
                  ? "bg-red-950/60 text-red-400 font-semibold border border-red-800/60"
                  : "text-red-400 hover:text-red-300 hover:bg-red-950/30"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-red-400 fill-red-400/20" />
              <span className="font-semibold text-red-400 text-xs">Admin</span>
            </Link>
          )}
        </nav>

        {/* 3. Right side: Circular user avatar image & dark pill button "Sign out" */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {/* Circular User Avatar */}
              <button
                type="button"
                onClick={onOpenThemeModal}
                className="flex items-center justify-center rounded-full p-0.5 hover:ring-1 hover:ring-zinc-600 transition"
                title={user.name || user.email || "User Profile"}
              >
                {!imageError && user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    onError={() => setImageError(true)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-zinc-700 shadow-sm"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full font-bold text-[10px] sm:text-xs flex items-center justify-center bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm">
                    {userInitial}
                  </div>
                )}
              </button>

              {/* Sign out Button */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-medium flex items-center gap-1 transition shadow-sm border border-zinc-700/60 active:scale-95"
                title="Sign out"
              >
                <span className="hidden md:inline">Sign out</span>
                <LogOut className="w-3 h-3 text-zinc-400" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 transition shadow-sm active:scale-95"
            >
              <span>Login</span>
              <LogIn className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
