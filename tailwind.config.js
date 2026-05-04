/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#ff2600',
            },
            fontFamily: {
                sans: ['"Euclid Circular B"', 'sans-serif'],
                serif: ['"SangBleu Kingdom"', 'serif'],
            },
        },
    },
    plugins: [],
}
