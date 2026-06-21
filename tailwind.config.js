const path = require("path");

const webPath = (...parts) => path.join(__dirname, "apps", "web", ...parts).replace(/\\/g, "/");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    webPath("pages/**/*.{js,ts,jsx,tsx,mdx}"),
    webPath("components/**/*.{js,ts,jsx,tsx,mdx}"),
    webPath("lib/**/*.{js,ts,jsx,tsx,mdx}"),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
