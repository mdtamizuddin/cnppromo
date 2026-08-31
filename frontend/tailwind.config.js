import withMT from "@material-tailwind/react/utils/withMT";
import daisyui from "daisyui";
import colors from "tailwindcss/colors";

export default withMT({
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: colors.emerald,
        rose: colors.rose,
        sky: colors.sky,
        slate: colors.slate,
        zinc: colors.zinc,
        violet: colors.violet,
        teal: colors.teal,
        cyan: colors.cyan,
        amber: colors.amber,

        // 🎨 Centralized App Brand Theme Tokens (Controlled via :root in index.css)
        primary: {
          DEFAULT: "var(--color-primary, #0D9488)",
          hover: "var(--color-primary-hover, #0F766E)",
          light: "var(--color-primary-light, #E6F8F5)",
          from: "var(--color-primary-gradient-from, #0EA5E9)",
          to: "var(--color-primary-gradient-to, #0D9488)",
        },
        brand: {
          DEFAULT: "var(--color-primary, #0D9488)",
          hover: "var(--color-primary-hover, #0F766E)",
          soft: "var(--color-primary-light, #E6F8F5)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary, #0284C7)",
          light: "var(--color-secondary-light, #E0F2FE)",
        },
        accent: {
          DEFAULT: "var(--color-accent, #F59E0B)",
          light: "var(--color-accent-light, #FEF3C7)",
        },
        canvas: "var(--color-canvas, #F8FAFC)",
        heading: "var(--color-heading, #0F172A)",
        bodyText: "var(--color-body, #475569)",
      }
    },
  },
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  plugins: [daisyui],
});