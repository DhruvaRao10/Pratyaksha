import React from "react";

const NotesIcon: React.FC<{ width?: number; height?: number }> = ({ width = 50, height = 50 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width={width} height={height}>
      <path d="M 14 4 C 8.486 4 4 8.486 4 14 L 4 36 C 4 41.514 8.486 46 14 46 L 36 46 C 41.514 46 46 41.514 46 36 L 46 14 C 46 8.486 41.514 4 36 4 L 14 4 z M 6 18 L 44 18 L 44 26 L 6 26 L 6 18 z M 8 20 L 8 22 L 10 22 L 10 20 L 8 20 z M 12 20 L 12 22 L 14 22 L 14 20 L 12 20 z M 16 20 L 16 22 L 18 22 L 18 20 L 16 20 z M 20 20 L 20 22 L 22 22 L 22 20 L 20 20 z M 24 20 L 24 22 L 26 22 L 26 20 L 24 20 z M 28 20 L 28 22 L 30 22 L 30 20 L 28 20 z M 32 20 L 32 22 L 34 22 L 34 20 L 32 20 z M 36 20 L 36 22 L 38 22 L 38 20 L 36 20 z M 40 20 L 40 22 L 42 22 L 42 20 L 40 20 z M 6 28 L 44 28 L 44 35 L 6 35 L 6 28 z M 6 37 L 44 37 C 43.505 40.94 40.072 44 36 44 L 14 44 C 9.928 44 6.495 40.94 6 37 z"/>
    </svg>
  );
};

export default NotesIcon;
