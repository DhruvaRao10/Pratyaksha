import React from "react";
import "../styles/appLayout.css"; 

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`logo-container ${className}`}>
      <span className="logo-text">PRATYAKSHA</span>
    </div>
  );
}
