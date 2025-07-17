import type { Metadata } from "next";
import { HeroUIProvider } from "@heroui/react";
import { Inter } from "next/font/google";

import "./globals.css";

export const metadata: Metadata = {
	title: "InfoTrack",
	description: "Система доведения информации до студентов",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<HeroUIProvider>
			<html lang="ru">
				<body className={`${inter.className} antialiased bg-gray-50`}>
					{children}
				</body>
			</html>
		</HeroUIProvider>
	);
}
