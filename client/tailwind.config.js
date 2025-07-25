import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
		"./app/**/*.{ts,tsx}",
	],
	theme: {
		extend: {},
	},
	darkMode: "class",
	plugins: [heroui()],
};
