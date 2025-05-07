//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import {
  MantineProvider,
  localStorageColorSchemeManager,
  useMantineColorScheme,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { HomePage } from "./pages/Home";
import { UploadPage } from "./pages/Upload";
import { YouTubePage } from "./pages/YouTube";
import { SettingsPage } from "./pages/Settings";
import { AnalysisHistoryPage } from "./pages/AnalysisHistory";
import { SearchPage } from "./pages/Search";
import Login from "./components/Login";
import Register from "./components/Reg";
import {theme} from "./theme"; 
import { cn } from "./lib/utils";
import { ToastContainer } from "react-toastify";
import { AppLayout } from "./components/AppLayout";
import { CollectionPage } from "./pages/Collection";
import { PDFViewerPage } from "./pages/PDFviewerPage";
import { GraphViewPage } from "./pages/GraphView";
import "./styles/collection.css"; // Keep if specific to collection page
import "./styles/global.css"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("access_token") !== null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const colorSchemeManager = localStorageColorSchemeManager({
  key: "intuit-notes-color-scheme",
});

function ColorSchemeToggleHotkey() {
  const { toggleColorScheme } = useMantineColorScheme();
  useHotkeys([["mod+J", () => toggleColorScheme()]]);
  return null;
}

export default function App() {
  // Removed isNavCollapsed state
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("access_token"));
    };
    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [location]);

  return (
    // Wrap with MantineProvider using your theme and color scheme manager
    <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
      {/* Notifications and Hotkey handler within Mantine context */}
      <Notifications position="top-right" />
      <ColorSchemeToggleHotkey />
      {/* ToastContainer outside MantineProvider if it's not Mantine's */}
      <ToastContainer />

      {/*
        ModeToggle can be placed here if you want it outside the layout,
        or inside AppLayout if you want it in the sidebar/header.
      */}
      {isAuthenticated && (
          <div className="absolute top-4 right-4 z-50"> {/* Position absolutely */}
              {/* <ModeToggle /> */}
          </div>
      )}


      {/*
        The main content area and layout is now handled by AppLayout.
        Remove the background/padding classes here as they are in global.css/AppLayout.
      */}
       <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/youtube-import"
            element={
              <ProtectedRoute>
                <YouTubePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AnalysisHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/research-collection"
            element={
              <ProtectedRoute>
                <CollectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/graph-view"
            element={
              <ProtectedRoute>
                <GraphViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdf/:docId"
            element={
              <ProtectedRoute>
                <PDFViewerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
            }
          />
        </Routes>
      </AppLayout>
    </MantineProvider>
  );
}