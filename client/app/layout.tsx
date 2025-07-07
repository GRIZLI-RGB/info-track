import type { Metadata } from "next";
import { HeroUIProvider } from "@heroui/react";

import "./globals.css";

export const metadata: Metadata = {
	title: "InfoTrack",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<HeroUIProvider>
			<html lang="ru">
				<body className={`antialiased`}>{children}</body>
			</html>
		</HeroUIProvider>
	);
}
