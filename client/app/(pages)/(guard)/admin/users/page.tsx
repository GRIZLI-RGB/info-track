"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

import api from "@/app/utils/api";

type PendingUser = {
	id: string;
	email: string;
	fio: string;
	status: string;
};

export default function PendingUsersPage() {
	const [users, setUsers] = useState<PendingUser[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchUsers = async () => {
		const res = await api.get("auth/pending-users");
		setUsers(res.data);
		setLoading(false);
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleApprove = async (id: string) => {
		await api.post(`auth/approve/${id}`);
		setUsers(users.filter((u) => u.id !== id));
	};

	const handleReject = async (id: string) => {
		await api.post(`auth/reject/${id}`);
		setUsers(users.filter((u) => u.id !== id));
	};

	if (loading) return <p className="p-4">Загрузка...</p>;

	return (
		<div className="p-6 space-y-4 max-w-3xl mx-auto">
			<h1 className="text-2xl font-bold">Новые пользователи</h1>
			{users.length === 0 && (
				<p className="text-muted-foreground">Нет заявок</p>
			)}
			{users.map((user) => (
				<div
					key={user.id}
					className="border rounded-lg p-4 flex items-center justify-between"
				>
					<div>
						<p className="font-medium">{user.fio}</p>
						<p className="text-muted-foreground">{user.email}</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="bordered"
							color="success"
							onPress={() => handleApprove(user.id)}
						>
							Подтвердить
						</Button>
						<Button
							variant="bordered"
							color="danger"
							onPress={() => handleReject(user.id)}
						>
							Отклонить
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}
