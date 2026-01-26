/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#8dc8a1", // Mint Green
                "primary-dark": "#7ab38e",
                "secondary": "#A0C8A0", // Soft Green
                "accent": "#F0B48C", // Pastel Orange
                "accent-champagne": "#e8d5c4",
                "text-dark": "#131614",
                "background-light": "#f8f9fa",
                "background-dark": "#151d18",
                "surface-light": "#ffffff",
                "surface-dark": "#1e2621",
                "text-main": "#131614",
                "text-muted": "#6d7e73",
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "2xl": "2rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
