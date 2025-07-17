// "use client";

// import { useEffect, useState } from "react";
// import { useAtom } from "jotai";
// import { Card, CardBody } from "@heroui/react";
// import { format } from "date-fns";
// import { ru } from "date-fns/locale/ru";
// import { useRouter } from "next/navigation";

// import { userAtom } from "@/app/utils/store";
// import api from "@/app/utils/api";

// type FeedItem = {
// 	id: string;
// 	title: string;
// 	content: string;
// 	startsAt: string;
// 	channel: { id: string; name: string };
// 	author: { id: string; fio: string };
// };

// export default function NewsPage() {
// 	const [userState] = useAtom(userAtom);
// 	const [news, setNews] = useState<FeedItem[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const router = useRouter();

// 	useEffect(() => {
// 		const fetchNews = async () => {
// 			try {
// 				const res = await api.get("news/feed", {
// 					params: { userId: userState.data?.id },
// 				});
// 				setNews(res.data);
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		if (userState.data) {
// 			fetchNews();
// 		}
// 	}, [userState.data]);

// 	if (loading) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center">
// 				<div className="animate-spin rounded-full border-4 border-gray-300 border-t-primary w-12 h-12" />
// 			</div>
// 		);
// 	}

// 	if (news.length === 0) {
// 		return (
// 			<div className="p-6 text-center text-muted-foreground">
// 				Нет новостей в ваших каналах
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="p-6 space-y-6 max-w-3xl mx-auto">
// 			<h1 className="text-3xl font-bold text-center">Лента новостей</h1>

// 			{news.map((item) => (
// 				<Card
// 					key={item.id}
// 					isPressable
// 					onPress={() => router.push(`/news/${item.id}`)}
// 					className="hover:shadow-md transition-shadow"
// 				>
// 					<CardBody className="space-y-1 p-5">
// 						<h2 className="text-xl font-semibold">{item.title}</h2>

// 						<p className="text-sm text-muted-foreground line-clamp-3">
// 							{item.content}
// 						</p>

// 						<div className="text-xs text-muted-foreground mt-2">
// 							{format(
// 								new Date(item.startsAt),
// 								"dd MMM yyyy HH:mm",
// 								{
// 									locale: ru,
// 								}
// 							)}
// 							{" · "}
// 							Канал: {item.channel.name}
// 							{" · "}
// 							Автор: {item.author.fio}
// 						</div>
// 					</CardBody>
// 				</Card>
// 			))}
// 		</div>
// 	);
// }

"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Card, Avatar, Chip, Skeleton } from "@heroui/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { useRouter } from "next/navigation";

import { userAtom } from "@/app/utils/store";
import api from "@/app/utils/api";

type FeedItem = {
	id: string;
	title: string;
	content: string;
	startsAt: string;
	channel: { id: string; name: string };
	author: { id: string; fio: string; avatar?: string };
	confirmed: boolean;
};

export default function NewsPage() {
	const [userState] = useAtom(userAtom);
	const [news, setNews] = useState<FeedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fetchNews = async () => {
			try {
				const res = await api.get("news/feed", {
					params: { userId: userState.data?.id },
				});
				setNews(res.data);
			} finally {
				setLoading(false);
			}
		};

		if (userState.data) {
			fetchNews();
		}
	}, [userState.data]);

	if (loading) {
		return (
			<div className="max-w-3xl mx-auto p-6 space-y-6">
				<Skeleton className="h-10 w-1/3 rounded-lg" />
				{[...Array(3)].map((_, i) => (
					<Card key={i} className="space-y-3 p-4">
						<Skeleton className="h-6 w-3/4 rounded-lg" />
						<Skeleton className="h-4 w-full rounded-lg" />
						<Skeleton className="h-4 w-2/3 rounded-lg" />
						<div className="flex gap-2">
							<Skeleton className="h-4 w-20 rounded-lg" />
							<Skeleton className="h-4 w-24 rounded-lg" />
						</div>
					</Card>
				))}
			</div>
		);
	}

	if (news.length === 0) {
		return (
			<div className="max-w-3xl mx-auto p-6">
				<div className="bg-muted rounded-lg p-8 text-center">
					<h2 className="text-xl font-semibold mb-2">
						Новостей пока нет
					</h2>
					<p className="text-muted-foreground">
						Когда в ваших каналах появятся новости, они отобразятся
						здесь
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Лента новостей</h1>
				<Chip color="primary" variant="dot">
					{news.length} новостей
				</Chip>
			</div>

			<div className="space-y-4">
				{news.map((item) => (
					<Card
						key={item.id}
						isPressable
						onPress={() => router.push(`/news/${item.id}`)}
						className="hover:shadow-md transition-shadow"
					>
						<div className="p-5">
							<div className="flex justify-between items-start gap-4">
								<div className="space-y-2">
									<h2 className="text-lg font-semibold">
										{item.title}
									</h2>
									<p className="text-sm text-muted-foreground line-clamp-2">
										{item.content}
									</p>
								</div>
								{item.confirmed && (
									<Chip
										size="sm"
										color="success"
										variant="flat"
									>
										Ознакомлен
									</Chip>
								)}
							</div>

							<div className="flex items-center gap-3 mt-4 pt-3 border-t border-divider">
								<Avatar
									name={item.author.fio}
									size="sm"
									className="text-xs"
								/>
								<div className="text-xs text-muted-foreground">
									<p>{item.author.fio}</p>
									<p>
										{format(
											new Date(item.startsAt),
											"dd MMM yyyy HH:mm",
											{
												locale: ru,
											}
										)}
										{" · "}
										{item.channel.name}
									</p>
								</div>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
