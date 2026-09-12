/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cinzel)", "Cinzel", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "Outfit", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        obsidian: {
          950: "#070709", // deep ink base
          900: "#0d0d12", // dark panel fill
          850: "#13131a", // raised surface
          800: "#1a1a24", // border line
          700: "#272738", // active border
        },
        arcane: {
          light: "#c4b5fd",
          DEFAULT: "#8b5cf6", // Saturated arcane violet primary accent
          dark: "#6d28d9",
          muted: "#4c1d95",
        },
        relic: {
          gold: "#f59e0b", // distinct reward/currency gold
          amber: "#d97706",
          emerald: "#10b981", // success/completion green
        },
      },
      boxShadow: {
        arcane: "0 0 25px -5px rgba(139, 92, 246, 0.25)",
        "arcane-lg": "0 0 50px -10px rgba(139, 92, 246, 0.35)",
        gold: "0 0 20px -5px rgba(245, 158, 11, 0.25)",
      },
    },
  },
  plugins: [],
};
