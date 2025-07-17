export type User = {
	id: string;
	email: string;
	fio: string;
	role: "admin" | "user";
	status: "approved" | "pending" | "rejected";
	created_at: string;
	updated_at: string;
};
