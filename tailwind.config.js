/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "rgb(var(--brand) / <alpha-value>)",
          accent: "rgb(var(--accent) / <alpha-value>)",
        },
        surface: Object.fromEntries(
          ["page", "card", "subtle", "tint"].map((key) => [
            key,
            `rgb(var(--${key}) / <alpha-value>)`,
          ]),
        ),
        text: {
          primary: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--muted) / <alpha-value>)",
        },
        type: {
          feature: "rgb(var(--feature) / <alpha-value>)",
          bug: "rgb(var(--bug) / <alpha-value>)",
        },
        line: "rgb(var(--line) / <alpha-value>)",
        "strong-line": "rgb(var(--strong-line) / <alpha-value>)",
        action: "rgb(var(--action) / <alpha-value>)",
        "action-ink": "rgb(var(--action-ink) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        focus: {
          base: "rgb(var(--focus-bg) / <alpha-value>)",
          ink: "rgb(var(--focus-ink) / <alpha-value>)",
          muted: "rgb(var(--focus-muted) / <alpha-value>)",
          accent: "rgb(var(--focus-accent) / <alpha-value>)",
        },
        due: {
          safe: "rgb(var(--safe) / <alpha-value>)",
          warning: "rgb(var(--warning-bg) / <alpha-value>)",
          overdue: "rgb(var(--overdue) / <alpha-value>)",
          neutral: "rgb(var(--neutral) / <alpha-value>)",
        },
      },
      fontFamily: { editorial: ["Georgia", "serif"] },
    },
  },
  plugins: [],
};
