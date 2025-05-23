"use client";
// @ts-nocheck

import React, { ReactNode } from "react";
import { Button } from "../ui/button";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "./theme-provider";
import Logo from "./Logo";
import FloatingShapes from "./FloatingShapes";
import { NavigationMenuDemo } from "../components/Navbar";
import "../styles/appLayout.css";
import { SearchContext } from "../pages/Home";
import { useState } from "react";

interface AppLayoutProps {
  children: ReactNode;
}
  
export function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div className="min-h-screen overflow-auto main-gradient-bg">
      <FloatingShapes />
        <div className="mx-auto px-6 py-3 flex items-center">
          <Logo className="mt-2 mr-8" />
          <div className="flex-1">
            <NavigationMenuDemo />
          </div>
        </div>
      <main className="min-h-screen overflow-y-auto content-overlay pt-16">
        <SearchContext.Provider
          value={{
            papers: [], 
            loading: false,
            error: null,
            query: "",
            setQuery: () => {},
            handleSearch: () => {},
          }}
        >
          {children}
        </SearchContext.Provider>
      </main>
    </div>
  );
}
