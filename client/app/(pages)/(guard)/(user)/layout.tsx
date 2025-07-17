"use client";

import { useAtom } from "jotai";
import { useRouter, usePathname } from "next/navigation";
import {
	Button,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	Link,
} from "@heroui/react";
import { LogOut, User } from "lucide-react";
import { useEffect } from "react";
import { userAtom } from "@/app/utils/store";

export default function UserLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [userState, setUserState] = useAtom(userAtom);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!userState.loading && !userState.data) {
			router.replace("/authorization");
		}
	}, [userState.loading, userState.data]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUserState({ data: null, loading: false, error: null });
		router.replace("/authorization");
	};

	return (
		<>
			<Navbar>
				<NavbarBrand>
					<Link href="/news" className="font-bold text-xl">
						InfoTrack
					</Link>
				</NavbarBrand>

				<NavbarContent justify="end">
					<NavbarItem>
						<Button
							isIconOnly
							variant={
								pathname === "/profile" ? "solid" : "light"
							}
							onPress={() => router.push("/profile")}
							aria-label="Профиль"
						>
							<User size={18} />
						</Button>
					</NavbarItem>
					<NavbarItem>
						<Button
							isIconOnly
							variant="light"
							aria-label="Выйти"
							onPress={handleLogout}
						>
							<LogOut size={18} />
						</Button>
					</NavbarItem>
				</NavbarContent>
			</Navbar>

			<main className="p-4 max-w-4xl mx-auto">{children}</main>
		</>
	);
}
