module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 6s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'progress-pulse': 'progress-pulse 1s ease-in-out infinite',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(147, 51, 234, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(236, 72, 153, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.1)',
      },
      colors: {
        tremor: {
          brand: {
            faint: "#eff6ff",
            muted: "#bfdbfe",
            subtle: "#60a5fa",
            DEFAULT: "#3b82f6",
            emphasis: "#1d4ed8",
            inverted: "#ffffff",
          },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
} 