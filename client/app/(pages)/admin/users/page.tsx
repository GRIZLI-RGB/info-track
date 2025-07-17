"use client";

import { useEffect, useState } from "react";

const UserApprovalList = () => {
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		const fetchUsers = async () => {
			const { data } = await axios.get("/api/admin/unverified-users");
			setUsers(data);
		};
		fetchUsers();
	}, []);

	const approveUser = async (userId: number) => {
		await axios.post(`/api/admin/approve-user/${userId}`);
		setUsers(users.filter((u) => u.id !== userId));
	};

	return (
		<div>
			<h1>Пользователи на подтверждение</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id}>
						{user.name} ({user.email})
						<button onClick={() => approveUser(user.id)}>
							Подтвердить
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default function AdminUsersPage() {
	return <UserApprovalList />;
}
