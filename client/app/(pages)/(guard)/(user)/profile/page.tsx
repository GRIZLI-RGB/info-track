"use client";

import { useAtom } from "jotai";
import {
	Card,
	CardHeader,
	CardBody,
	Divider,
	Chip,
	Progress,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { userAtom } from "@/app/utils/store";
import api from "@/app/utils/api";

const statusColorMap = {
	approved: "success",
	pending: "warning",
	rejected: "danger",
} as const;

export default function ProfilePage() {
	const [userState] = useAtom(userAtom);
	const user = userState.data;

	const [rating, setRating] = useState<{
		total: number;
		confirmed: number;
		percentage: number;
	} | null>(null);

	useEffect(() => {
		if (!user) return;

		api.get(`users/${user.id}/rating`).then((res) => setRating(res.data));
	}, [user]);

	if (!user || !rating) return null;

	return (
		<Card>
			<CardHeader className="text-xl font-bold">Профиль</CardHeader>
			<Divider />
			<CardBody className="space-y-3 text-sm">
				<p>
					<b>ФИО:</b> {user.fio}
				</p>
				<p>
					<b>Email:</b> {user.email}
				</p>
				<p>
					<b>Роль:</b>{" "}
					{
						{ user: "пользователь", admin: "администратор" }[
							user.role
						]
					}
				</p>
				<p className="flex items-center gap-2">
					<b>Статус:</b>
					<Chip
						color={statusColorMap[user.status]}
						variant="flat"
						size="sm"
					>
						{
							{
								approved: "одобрен",
								pending: "ждет одобрения",
								rejected: "отклонен",
							}[user.status]
						}
					</Chip>
				</p>

				<p>
					Рейтинг дисциплины:{" "}
					<Chip color="primary" variant="flat">
						{rating.percentage}%
					</Chip>
				</p>
				<Progress
					value={rating.percentage}
					label={`Ознакомлено ${rating.confirmed} из ${rating.total}`}
				/>
			</CardBody>
		</Card>
	);
}
