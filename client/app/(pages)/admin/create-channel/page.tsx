"use client";

import { useEffect, useState } from "react";

const CreateChannelForm = () => {
	const [form, setForm] = useState({
		name: "",
		description: "",
		adminIds: [] as number[],
		userIds: [] as number[],
	});

	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		const fetchUsers = async () => {
			const { data } = await axios.get("/api/users");
			setUsers(data);
		};
		fetchUsers();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await axios.post("/api/channels", form);
		// Перенаправить или показать сообщение об успехе
	};

	return (
		<form onSubmit={handleSubmit}>
			{/* Поля формы */}
			<div>
				<label>Администраторы канала:</label>
				<MultiSelect
					options={users.map((u) => ({ value: u.id, label: u.name }))}
					onChange={(selected) =>
						setForm({
							...form,
							adminIds: selected.map((s) => s.value),
						})
					}
				/>
			</div>
			{/* Аналогично для пользователей канала */}
			<button type="submit">Создать канал</button>
		</form>
	);
};

export default function AdminCreateChannelPage() {
	return <></>;
}
