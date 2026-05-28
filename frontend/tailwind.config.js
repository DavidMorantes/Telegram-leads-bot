/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09111f",
        accent: "#0f766e",
        sand: "#f5f2ea",
        slatefine: "#dbe4f0",
      },
      boxShadow: {
        panel: "0 20px 45px rgba(2, 6, 23, 0.12)",
      },
    },
  },
  plugins: [],
};
