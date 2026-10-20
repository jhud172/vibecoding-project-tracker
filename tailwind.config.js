/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { primary: "#264F3D", accent: "#DCE8C7" },
        surface: { page: "#F6F5F0", card: "#FFFFFF" },
        text: { primary: "#252B27", muted: "#647066" },
        type: { feature: "#426746", bug: "#A44235" },
        due: {
          safe: "#E8EFE5",
          warning: "#FBEDCB",
          overdue: "#FBE5DF",
          neutral: "#EDF0EC",
        },
      },
      fontFamily: { editorial: ["Georgia", "serif"] },
    },
  },
  plugins: [],
};
