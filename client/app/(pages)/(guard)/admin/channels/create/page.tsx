"use client";

import { useEffect, useState } from "react";
import {
	Button,
	Input,
	Select,
	SelectItem,
	CheckboxGroup,
	Checkbox,
} from "@heroui/react";
import api from "@/app/utils/api";
import { User } from "@/app/utils/types";

export default function CreateChannelPage() {
	const [name, setName] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [adminId, setAdminId] = useState<string>("");
	const [userIds, setUserIds] = useState<string[]>([]);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		api.get("users/approved").then((res) => setUsers(res.data));
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		await api.post("channels", {
			name,
			adminId,
			userIds,
		});

		setSuccess(true);
		setName("");
		setAdminId("");
		setUserIds([]);
	};

	if (success) {
		return (
			<div className="p-4">
				<h2 className="text-2xl font-bold mb-2">Канал создан</h2>
				<Button onPress={() => setSuccess(false)}>
					Создать другой
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-xl mx-auto space-y-6">
			<h1 className="text-2xl font-bold">Создание канала</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Название канала"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>

				<Select
					label="Администратор канала"
					selectedKeys={[adminId]}
					onSelectionChange={(keys) => {
						const selected = Array.from(keys)[0];

						if (selected !== undefined) {
							setAdminId(String(selected));
						}
					}}
				>
					{users.map((u) => (
						<SelectItem key={u.id}>
							{u.fio} ({u.email})
						</SelectItem>
					))}
				</Select>

				<CheckboxGroup
					label="Участники канала"
					value={userIds}
					onValueChange={setUserIds}
				>
					{users.map((u) => (
						<Checkbox key={u.id} value={String(u.id)}>
							{u.fio} ({u.email})
						</Checkbox>
					))}
				</CheckboxGroup>

				<Button type="submit" color="primary">
					Создать канал
				</Button>
			</form>
		</div>
	);
}
