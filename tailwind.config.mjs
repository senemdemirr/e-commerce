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
                "white": "#ffffff",
                "gray": {
                    "50": "#f9fafb",
                    "100": "#f3f4f6",
                    "200": "#e5e7eb",
                    "300": "#d1d5db",
                    "400": "#9ca3af",
                    "500": "#6b7280",
                    "600": "#4b5563",
                    "700": "#374151",
                    "800": "#1f2937",
                    "900": "#111827",
                    "950": "#030712"
                }
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
            boxShadow: {
                'invoice': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Explicit rgba for PDF
                'primary-glow': '0 10px 15px -3px rgba(141, 200, 161, 0.2)' // Explicit rgba
            },
        },
    },
    plugins: [],
}
