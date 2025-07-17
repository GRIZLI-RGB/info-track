"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Alert, Tabs, Tab } from "@heroui/react";
import { Mail, Lock, User } from "lucide-react";
import api from "@/app/utils/api";

export default function AuthPage() {
	const router = useRouter();
	const [mode, setMode] = useState<"login" | "register">("login");
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			if (mode === "register") {
				await api.post("auth/register", form);
				setSuccess(true);
			} else {
				const { data } = await api.post("auth/login", {
					email: form.email,
					password: form.password,
				});
				localStorage.setItem("token", data.token);
				router.push("/");
			}
			// eslint-disable-next-line
		} catch (err: any) {
			const msg =
				err?.response?.data?.message ||
				(mode === "register"
					? "Ошибка при регистрации"
					: "Ошибка при входе");
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	};

	if (success && mode === "register") {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<h1 className="text-3xl font-bold tracking-tight">
							Регистрация завершена
						</h1>
						<p className="mt-2 text-muted-foreground">
							Ваш аккаунт будет активирован после подтверждения
							администратором.
						</p>
					</div>
					<Button
						variant="bordered"
						className="w-full"
						onPress={() => {
							setMode("login");
							setSuccess(false);
						}}
					>
						Перейти ко входу
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight">
						{mode === "register" ? "Регистрация" : "Вход"}
					</h1>
					<p className="mt-2 text-muted-foreground">
						{mode === "register"
							? "Введите данные для создания аккаунта"
							: "Введите данные для входа"}
					</p>
				</div>

				<Tabs
					selectedKey={mode}
					onSelectionChange={(key) =>
						setMode(key as "login" | "register")
					}
					aria-label="Режим"
					variant="underlined"
				>
					<Tab key="login" title="Вход" />
					<Tab key="register" title="Регистрация" />
				</Tabs>

				{error && (
					<Alert description={error} title="Ошибка" color="danger" />
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					{mode === "register" && (
						<Input
							label="ФИО"
							id="name"
							required
							value={form.name}
							onChange={(e) =>
								setForm({ ...form, name: e.target.value })
							}
							placeholder="Иванов Иван Иванович"
							startContent={
								<User className="text-muted-foreground h-4 w-4" />
							}
						/>
					)}

					<Input
						label="Email"
						id="email"
						type="email"
						required
						value={form.email}
						onChange={(e) =>
							setForm({ ...form, email: e.target.value })
						}
						placeholder="example@university.edu"
						startContent={
							<Mail className="text-muted-foreground h-4 w-4" />
						}
					/>

					<Input
						label="Пароль"
						id="password"
						type="password"
						required
						value={form.password}
						onChange={(e) =>
							setForm({ ...form, password: e.target.value })
						}
						placeholder="••••••••"
						startContent={
							<Lock className="text-muted-foreground h-4 w-4" />
						}
					/>

					<Button
						color="primary"
						type="submit"
						className="w-full"
						isLoading={isLoading}
					>
						{mode === "register" ? "Зарегистрироваться" : "Войти"}
					</Button>
				</form>

				{mode === "register" && (
					<div className="rounded-lg border bg-muted p-4 text-center text-sm text-muted-foreground">
						После регистрации аккаунт должен быть подтвержден
						администратором.
					</div>
				)}
			</div>
		</div>
	);
}
