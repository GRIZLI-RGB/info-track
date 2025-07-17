// "use client";

// import { useParams } from "next/navigation";
// import { useAtom } from "jotai";
// import { useEffect, useState } from "react";
// import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
// import { format } from "date-fns";
// import { ru } from "date-fns/locale/ru";

// import { userAtom } from "@/app/utils/store";
// import api from "@/app/utils/api";

// type NewsItem = {
// 	id: string;
// 	title: string;
// 	content: string;
// 	startsAt: string;
// 	channel: { name: string };
// 	author: { fio: string };
// };

// export default function NewsDetailsPage() {
// 	const params = useParams();
// 	const newsId = params.id as string;
// 	const [user] = useAtom(userAtom);
// 	const [news, setNews] = useState<NewsItem | null>(null);
// 	const [confirmed, setConfirmed] = useState(false);
// 	const [count, setCount] = useState(0);

// 	useEffect(() => {
// 		api.get(`news/${newsId}`).then((res) => setNews(res.data));
// 		api.get(`news/${newsId}/stats`).then((res) => setCount(res.data.count));
// 	}, [newsId]);

// 	useEffect(() => {
// 		if (!user.data) return;

// 		api.get(`news/${newsId}/confirm-status`, {
// 			params: { userId: user.data.id },
// 		}).then((res) => {
// 			setConfirmed(res.data.confirmed);
// 		});
// 	}, [newsId, user.data]);

// 	const handleConfirm = async () => {
// 		await api.post(`news/${newsId}/confirm`, {
// 			userId: user.data?.id,
// 		});
// 		setConfirmed(true);
// 		setCount((c) => c + 1);
// 	};

// 	if (!news) return null;

// 	return (
// 		<Card>
// 			<CardHeader className="text-xl font-bold">{news.title}</CardHeader>
// 			<CardBody className="space-y-4">
// 				<p className="text-sm text-muted-foreground">
// 					Дата:{" "}
// 					{format(new Date(news.startsAt), "dd MMM yyyy HH:mm", {
// 						locale: ru,
// 					})}
// 					{" · "}
// 					Автор: {news.author.fio}
// 					{" · "}
// 					Канал: {news.channel.name}
// 				</p>
// 				<p>{news.content}</p>

// 				{confirmed ? (
// 					<Chip color="success" variant="flat">
// 						Вы подтвердили ознакомление
// 					</Chip>
// 				) : (
// 					<Button onPress={handleConfirm} color="primary">
// 						Подтвердить ознакомление
// 					</Button>
// 				)}

// 				<div className="text-sm text-muted-foreground">
// 					Ознакомилось пользователей: <b>{count}</b>
// 				</div>
// 			</CardBody>
// 		</Card>
// 	);
// }

"use client";

import { useParams } from "next/navigation";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Card, Avatar, Button, Chip, Divider, Progress } from "@heroui/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { Check, Clock, Users } from "lucide-react";

import { userAtom } from "@/app/utils/store";
import api from "@/app/utils/api";

type NewsItem = {
	id: string;
	title: string;
	content: string;
	startsAt: string;
	endsAt: string;
	channel: { name: string; description?: string };
	author: { fio: string; avatar?: string };
	stats: {
		totalUsers: number;
		confirmed: number;
		percentage: number;
	};
};

export default function NewsDetailsPage() {
	const params = useParams();
	const newsId = params.id as string;
	const [user] = useAtom(userAtom);
	const [news, setNews] = useState<NewsItem | null>(null);
	const [confirmed, setConfirmed] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user.data) return;

		api.get(`news/${newsId}/confirm-status`, {
			params: { userId: user.data.id },
		}).then((res) => {
			setConfirmed(res.data.confirmed);
		});
	}, [newsId, user.data]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const newsRes = await api.get(`news/${newsId}`);
				const statsRes = await api.get(`news/${newsId}/stats`);

				setNews({
					...newsRes.data,
					stats: {
						confirmed: statsRes.data.count,
						totalUsers: newsRes.data.totalUsers ?? 0, // или как у тебя приходит
						percentage: newsRes.data.totalUsers
							? Math.round(
									(statsRes.data.count /
										newsRes.data.totalUsers) *
										100
							  )
							: 0,
					},
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [newsId]);

	const handleConfirm = async () => {
		setLoading(true);
		try {
			await api.post(`news/${newsId}/confirm`, {
				userId: user.data?.id,
			});
			setConfirmed(true);
			setNews((prev) =>
				prev
					? {
							...prev,
							stats: {
								...prev.stats,
								confirmed: prev.stats.confirmed + 1,
								percentage: Math.round(
									((prev.stats.confirmed + 1) /
										prev.stats.totalUsers) *
										100
								),
							},
					  }
					: null
			);
		} finally {
			setLoading(false);
		}
	};

	if (!news) return null;

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<Card>
				<div className="p-6 space-y-6">
					<div className="space-y-2">
						<Chip color="primary" variant="dot">
							{news.channel.name}
						</Chip>
						<h1 className="text-2xl font-bold">{news.title}</h1>
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Avatar
									name={news.author.fio}
									size="sm"
									className="text-xs"
								/>
								<span>{news.author.fio}</span>
							</div>
							<span>•</span>
							<div className="flex items-center gap-1">
								<Clock className="w-4 h-4" />
								<span>
									{format(
										new Date(news.startsAt),
										"dd MMM yyyy HH:mm",
										{
											locale: ru,
										}
									)}
								</span>
							</div>
						</div>
					</div>

					<Divider />

					<div className="prose max-w-none">
						<p className="whitespace-pre-line">{news.content}</p>
					</div>

					<Divider />

					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<Users className="w-5 h-5 text-muted-foreground" />
								<span className="font-medium">
									Ознакомились: {news.stats.confirmed}/
									{news.stats.totalUsers}
								</span>
							</div>
							<Chip color="primary" variant="flat">
								{news.stats.percentage}%
							</Chip>
						</div>

						<Progress
							value={news.stats.percentage}
							color={
								news.stats.percentage > 90
									? "success"
									: news.stats.percentage > 60
									? "warning"
									: "danger"
							}
							size="lg"
						/>

						{confirmed ? (
							<Button
								variant="flat"
								color="success"
								startContent={<Check className="w-5 h-5" />}
								fullWidth
								disabled
							>
								Вы подтвердили ознакомление
							</Button>
						) : (
							<Button
								onPress={handleConfirm}
								color="primary"
								isLoading={loading}
								fullWidth
							>
								Подтвердить ознакомление
							</Button>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
}
