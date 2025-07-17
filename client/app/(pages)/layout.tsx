"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtom } from "jotai";

import api from "../utils/api";
import { User } from "../utils/types";
import { userAtom } from "../utils/store";

export default function Layout({ children }: { children: React.ReactNode }) {
	const [userState, setUserState] = useAtom(userAtom);
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		const fetchUser = async () => {
			setUserState((prev) => ({ ...prev, loading: true }));

			try {
				const { data } = await api.get<User>("auth/me");

				setUserState({ data, loading: false, error: null });

				// GUARD: /admin → только для admin
				if (pathname.startsWith("/admin") && data.role !== "admin") {
					router.replace("/authorization");
				}
			} catch {
				setUserState({
					data: null,
					loading: false,
					error: "not-authenticated",
				});

				// GUARD: редирект если не авторизован
				if (
					!pathname.startsWith("/authorization") &&
					!pathname.startsWith("/public") &&
					!pathname.startsWith("/_next")
				) {
					router.replace("/authorization");
				}
			}
		};

		if (typeof window !== "undefined" && localStorage.getItem("token")) {
			fetchUser();
		} else {
			setUserState({ data: null, loading: false, error: null });
		}
	}, [pathname]);

	if (userState.loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white animate-fade-in">
				<div className="animate-spin rounded-full border-4 border-gray-300 border-t-primary w-12 h-12" />
			</div>
		);
	}

	return <>{children}</>;
}
