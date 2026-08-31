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
        'primary': '#050C9C',
        "secondary": "#3ABEF9",
        "T2": "#E52548",
        // Messaging surface tokens. `brand` is the interactive accent the
        // newest screens already use; `canvas` is the app-wide page ground.
        "brand": "#5a32fa",
        "brand-soft": "#efeaff",
        "canvas": "#f8faff"
      }
    },
  },
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
  plugins: [daisyui],
});