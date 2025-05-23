import React from "react";

interface SearchIconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onClick?: () => void;
}

export function SearchIcon({ className, onClick, ...props }: SearchIconProps) {
  return (
    <div
      onClick={onClick}
      className={`search-icon ${className || ''}`}
      style={{ cursor: 'pointer' }}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="search-icon-svg"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </div>
  );
}

const styles = `
  .search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s ease;
    color: white;
  }

  .search-icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .search-icon:active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .search-icon-svg {
    color: white;
    width: 20px;
    height: 20px;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}