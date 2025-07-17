"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

import { Button, Input, Alert } from "@heroui/react";

import { Mail, User, Lock } from "lucide-react";

export default function RegisterPage() {
	const router = useRouter();

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
			await axios.post("/api/auth/register", form);
			setSuccess(true);
		} catch {
			setError("Произошла ошибка при регистрации");
		} finally {
			setIsLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<h1 className="text-3xl font-bold tracking-tight">
							Регистрация завершена
						</h1>
						<p className="mt-2 text-muted-foreground">
							Ваш аккаунт будет активирован после подтверждения
							администратором. Мы отправим вам уведомление на
							почту.
						</p>
					</div>
					<Button
						variant="bordered"
						className="w-full"
						onPress={() => router.push("/login")}
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
						Создайте аккаунт
					</h1>
					<p className="mt-2 text-muted-foreground">
						Введите свои данные для регистрации
					</p>
				</div>

				{error && (
					<Alert description={error} title="Ошибка" color="danger" />
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Input
							label="ФИО"
							id="name"
							placeholder="Иванов Иван Иванович"
							required
							value={form.name}
							onChange={(e) =>
								setForm({ ...form, name: e.target.value })
							}
							startContent={
								<User className="text-muted-foreground h-4 w-4" />
							}
						/>
					</div>

					<div className="space-y-2">
						<Input
							label="Email"
							id="email"
							type="email"
							placeholder="example@university.edu"
							required
							value={form.email}
							onChange={(e) =>
								setForm({ ...form, email: e.target.value })
							}
							startContent={
								<Mail className="text-muted-foreground h-4 w-4" />
							}
						/>
					</div>

					<div className="space-y-2">
						<Input
							label="Пароль"
							id="password"
							type="password"
							placeholder="••••••••"
							required
							minLength={6}
							value={form.password}
							onChange={(e) =>
								setForm({
									...form,
									password: e.target.value,
								})
							}
							startContent={
								<Lock className="text-muted-foreground h-4 w-4" />
							}
						/>
					</div>

					<Button
						color="primary"
						type="submit"
						className="w-full"
						isLoading={isLoading}
					>
						{isLoading ? "Регистрация..." : "Зарегистрироваться"}
					</Button>
				</form>

				<div className="text-center text-sm text-muted-foreground">
					Уже есть аккаунт?{" "}
					<Link
						href="/login"
						className="font-medium text-primary hover:underline"
					>
						Войти
					</Link>
				</div>

				<div className="rounded-lg border bg-muted p-4 text-center text-sm text-muted-foreground">
					После регистрации ваш аккаунт должен быть подтвержден
					администратором. Вы получите уведомление по электронной
					почте.
				</div>
			</div>
		</div>
	);
}
