"use client";

import { useParams } from "next/navigation";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

import { userAtom } from "@/app/utils/store";
import api from "@/app/utils/api";

type NewsItem = {
	id: string;
	title: string;
	content: string;
	startsAt: string;
	channel: { name: string };
	author: { fio: string };
};

export default function NewsDetailsPage() {
	const params = useParams();
	const newsId = params.id as string;
	const [user] = useAtom(userAtom);
	const [news, setNews] = useState<NewsItem | null>(null);
	const [confirmed, setConfirmed] = useState(false);
	const [count, setCount] = useState(0);

	useEffect(() => {
		api.get(`news/${newsId}`).then((res) => setNews(res.data));
		api.get(`news/${newsId}/stats`).then((res) => setCount(res.data.count));
	}, [newsId]);

	useEffect(() => {
		if (!user.data) return;

		api.get(`news/${newsId}/confirm-status`, {
			params: { userId: user.data.id },
		}).then((res) => {
			setConfirmed(res.data.confirmed);
		});
	}, [newsId, user.data]);

	const handleConfirm = async () => {
		await api.post(`news/${newsId}/confirm`, {
			userId: user.data?.id,
		});
		setConfirmed(true);
		setCount((c) => c + 1);
	};

	if (!news) return null;

	return (
		<Card>
			<CardHeader className="text-xl font-bold">{news.title}</CardHeader>
			<CardBody className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Дата:{" "}
					{format(new Date(news.startsAt), "dd MMM yyyy HH:mm", {
						locale: ru,
					})}
					{" · "}
					Автор: {news.author.fio}
					{" · "}
					Канал: {news.channel.name}
				</p>
				<p>{news.content}</p>

				{confirmed ? (
					<Chip color="success" variant="flat">
						Вы подтвердили ознакомление
					</Chip>
				) : (
					<Button onPress={handleConfirm} color="primary">
						Подтвердить ознакомление
					</Button>
				)}

				<div className="text-sm text-muted-foreground">
					Ознакомилось пользователей: <b>{count}</b>
				</div>
			</CardBody>
		</Card>
	);
}
