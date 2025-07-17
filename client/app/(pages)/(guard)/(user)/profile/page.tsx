// "use client";

// import { useAtom } from "jotai";
// import {
// 	Card,
// 	CardHeader,
// 	CardBody,
// 	Divider,
// 	Chip,
// 	Progress,
// } from "@heroui/react";
// import { useEffect, useState } from "react";

// import { userAtom } from "@/app/utils/store";
// import api from "@/app/utils/api";

// const statusColorMap = {
// 	approved: "success",
// 	pending: "warning",
// 	rejected: "danger",
// } as const;

// export default function ProfilePage() {
// 	const [userState] = useAtom(userAtom);
// 	const user = userState.data;

// 	const [rating, setRating] = useState<{
// 		total: number;
// 		confirmed: number;
// 		percentage: number;
// 	} | null>(null);

// 	useEffect(() => {
// 		if (!user) return;

// 		api.get(`users/${user.id}/rating`).then((res) => setRating(res.data));
// 	}, [user]);

// 	if (!user || !rating) return null;

// 	return (
// 		<Card>
// 			<CardHeader className="text-xl font-bold">Профиль</CardHeader>
// 			<Divider />
// 			<CardBody className="space-y-3 text-sm">
// 				<p>
// 					<b>ФИО:</b> {user.fio}
// 				</p>
// 				<p>
// 					<b>Email:</b> {user.email}
// 				</p>
// 				<p>
// 					<b>Роль:</b>{" "}
// 					{
// 						{ user: "пользователь", admin: "администратор" }[
// 							user.role
// 						]
// 					}
// 				</p>
// 				<p className="flex items-center gap-2">
// 					<b>Статус:</b>
// 					<Chip
// 						color={statusColorMap[user.status]}
// 						variant="flat"
// 						size="sm"
// 					>
// 						{
// 							{
// 								approved: "одобрен",
// 								pending: "ждет одобрения",
// 								rejected: "отклонен",
// 							}[user.status]
// 						}
// 					</Chip>
// 				</p>

// 				<p>
// 					Рейтинг дисциплины:{" "}
// 					<Chip color="primary" variant="flat">
// 						{rating.percentage}%
// 					</Chip>
// 				</p>

// 				<Progress
// 					value={rating.percentage}
// 					label={`Ознакомлено ${rating.confirmed} из ${rating.total}`}
// 				/>
// 			</CardBody>
// 		</Card>
// 	);
// }

"use client";

import { useAtom } from "jotai";
import { Avatar, Card, Divider, Chip, Progress, Button } from "@heroui/react";
import { Mail, User, Shield, Clock, Check, X } from "lucide-react";
import { useEffect, useState } from "react";

import { userAtom } from "@/app/utils/store";
import api from "@/app/utils/api";

const statusIcons = {
	approved: <Check className="w-4 h-4" />,
	pending: <Clock className="w-4 h-4" />,
	rejected: <X className="w-4 h-4" />,
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
		<div className="max-w-2xl mx-auto p-4 space-y-6">
			<Card className="overflow-hidden">
				{/* <div className="bg-gradient-to-r from-primary-500/25 to-secondary-500/20 h-24" /> */}
				<div className="px-6 pb-6 relative">
					<div className="flex justify-between items-start mt-6">
						<div className="flex items-center gap-4">
							<Avatar
								name={user.fio}
								className="w-24 h-[90px] block text-2xl border-4 border-background"
							/>
							<div>
								<h1 className="text-2xl font-bold">
									{user.fio}
								</h1>
								<div className="flex items-center gap-2 mt-1">
									<Chip
										color={
											user.status === "approved"
												? "success"
												: user.status === "pending"
												? "warning"
												: "danger"
										}
										startContent={statusIcons[user.status]}
										size="sm"
									>
										{
											{
												approved: "Активен",
												pending: "На проверке",
												rejected: "Отклонен",
											}[user.status]
										}
									</Chip>
									<Chip
										color={
											user.role === "admin"
												? "secondary"
												: "default"
										}
										startContent={
											<Shield className="w-4 h-4" />
										}
										size="sm"
									>
										{user.role === "admin"
											? "Администратор"
											: "Пользователь"}
									</Chip>
								</div>
							</div>
						</div>
						<Button variant="bordered" size="sm">
							Редактировать
						</Button>
					</div>

					<Divider className="my-6" />

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground flex items-center gap-2">
								<Mail className="w-4 h-4" /> Email
							</p>
							<p className="font-medium">{user.email}</p>
						</div>

						<div className="space-y-1">
							<p className="text-sm text-muted-foreground flex items-center gap-2">
								<User className="w-4 h-4" /> ID
							</p>
							<p className="font-medium">{user.id}</p>
						</div>
					</div>
				</div>
			</Card>

			<Card>
				<div className="p-6 space-y-4">
					<h2 className="text-xl font-semibold">
						Статистика дисциплины
					</h2>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm">
								Процент ознакомления
							</span>
							<span className="font-medium">
								{rating.percentage}%
							</span>
						</div>
						<Progress
							value={rating.percentage}
							color={
								rating.percentage > 90
									? "success"
									: rating.percentage > 60
									? "warning"
									: "danger"
							}
							size="lg"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4 pt-2">
						<div className="bg-muted p-4 rounded-lg text-center">
							<p className="text-2xl font-bold">
								{rating.confirmed}
							</p>
							<p className="text-sm text-muted-foreground">
								Ознакомлено
							</p>
						</div>
						<div className="bg-muted p-4 rounded-lg text-center">
							<p className="text-2xl font-bold">
								{rating.total - rating.confirmed}
							</p>
							<p className="text-sm text-muted-foreground">
								Осталось
							</p>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
