"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
	Button,
	Input,
	Textarea,
	DatePicker,
	CalendarDate,
} from "@heroui/react";
import { getLocalTimeZone } from "@internationalized/date";

import api from "@/app/utils/api";
import { useAtomValue } from "jotai";
import { userAtom } from "@/app/utils/store";

export default function CreateNewsPage() {
	const { id: channelId } = useParams();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [startsAt, setStartsAt] = useState<CalendarDate | null>(null);
	const [endsAt, setEndsAt] = useState<CalendarDate | null>(null);
	const [success, setSuccess] = useState(false);
	const user = useAtomValue(userAtom);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		await api.post("news", {
			title,
			content,
			channelId,
			startsAt: startsAt!.toDate(getLocalTimeZone()),
			endsAt: endsAt ? endsAt.toDate(getLocalTimeZone()) : null,
			authorId: user.data?.id || 0,
		});

		setSuccess(true);
	};

	if (success) {
		return (
			<div className="p-6 max-w-xl mx-auto">
				<h1 className="text-xl font-bold">Новость опубликована</h1>
				<Button onPress={() => setSuccess(false)} className="mt-4">
					Создать ещё
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-xl mx-auto space-y-6">
			<h1 className="text-2xl font-bold">Создание новости</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Заголовок"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
				<Textarea
					label="Содержание"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
				/>
				<DatePicker
					label="Дата начала публикации"
					value={startsAt}
					onChange={setStartsAt}
					isRequired
				/>
				<DatePicker
					label="Дата окончания (необязательно)"
					value={endsAt}
					onChange={setEndsAt}
				/>
				<Button type="submit" color="primary">
					Опубликовать
				</Button>
			</form>
		</div>
	);
}
