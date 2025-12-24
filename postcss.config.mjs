/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // Autoprefixer is built into Tailwind CSS 4, but we can add explicit config if needed
    // Tailwind CSS 4 handles autoprefixing automatically
  },
}

export default config
