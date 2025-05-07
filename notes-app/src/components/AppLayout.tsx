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
      <header className="fixed top-0 left-0 right-0 z-20 premium-glass border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto px-6 py-3 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-4">
            <div className="nav-container">
              <NavigationMenuDemo />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              {theme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="min-h-screen overflow-y-auto content-overlay pt-16">
        <SearchContext.Provider value={{
          papers: [], // Initial empty values
          loading: false,
          error: null,
          query: "",
          setQuery: () => {},
          handleSearch: () => {},
        }}>
          {children}
        </SearchContext.Provider>
      </main>
    </div>
  );
}