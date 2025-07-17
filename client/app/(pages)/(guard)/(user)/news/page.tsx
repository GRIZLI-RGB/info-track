"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Card, CardBody } from "@heroui/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

import { userAtom } from "@/app/utils/store";
import api from "@/app/utils/api";
import { useRouter } from "next/navigation";

type FeedItem = {
	id: string;
	title: string;
	content: string;
	startsAt: string;
	channel: { id: string; name: string };
	author: { id: string; fio: string };
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full border-4 border-gray-300 border-t-primary w-12 h-12" />
			</div>
		);
	}

	if (news.length === 0) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				Нет новостей в ваших каналах
			</div>
		);
	}

	// return (
	// 	<div className="p-6 space-y-4 max-w-3xl mx-auto">
	// 		<h1 className="text-3xl font-bold mb-4">Лента новостей</h1>

	// 		{news.map((item) => (
	// 			<Card key={item.id}>
	// 				<CardBody className="space-y-2 p-4">
	// 					<div className="text-sm text-muted-foreground">
	// 						{format(
	// 							new Date(item.startsAt),
	// 							"dd MMM yyyy HH:mm",
	// 							{
	// 								locale: ru,
	// 							}
	// 						)}
	// 						{" · "}
	// 						Канал: <b>{item.channel.name}</b>
	// 						{" · "}
	// 						Автор: <b>{item.author.fio}</b>
	// 					</div>
	// 					<h2 className="text-lg font-semibold">{item.title}</h2>
	// 					<p className="text-sm">{item.content}</p>
	// 				</CardBody>
	// 			</Card>
	// 		))}
	// 	</div>
	// );

	return (
		<div className="p-6 space-y-6 max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold text-center">Лента новостей</h1>

			{news.map((item) => (
				<Card
					key={item.id}
					isPressable
					onPress={() => router.push(`/news/${item.id}`)}
					className="hover:shadow-md transition-shadow"
				>
					<CardBody className="space-y-1 p-5">
						<h2 className="text-xl font-semibold">{item.title}</h2>

						<p className="text-sm text-muted-foreground line-clamp-3">
							{item.content}
						</p>

						<div className="text-xs text-muted-foreground mt-2">
							{format(
								new Date(item.startsAt),
								"dd MMM yyyy HH:mm",
								{
									locale: ru,
								}
							)}
							{" · "}
							Канал: {item.channel.name}
							{" · "}
							Автор: {item.author.fio}
						</div>
					</CardBody>
				</Card>
			))}
		</div>
	);
}
