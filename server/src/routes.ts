import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AppDataSource } from "./configs/database";
import { User } from "./entities";

const router = Router();

router.post("/auth/register", async (req: Request, res: Response) => {
	const { name, email, password } = req.body;

	if (!email || !password || !name) {
		res.status(400).json({ message: "Заполните все поля" });
		return;
	}

	const repo = AppDataSource.getRepository(User);
	const exists = await repo.findOneBy({ email });

	if (exists) {
		res.status(409).json({ message: "Пользователь уже зарегистрирован" });
		return;
	}

	const user = repo.create({
		email,
		passwordHash: await bcrypt.hash(password, 10),
		role: "user",
		status: "pending",
		fio: name,
	});
	await repo.save(user);

	res.status(201).json({ message: "Ожидайте подтверждения" });
});

router.post("/auth/login", async (req: Request, res: Response) => {
	const { email, password } = req.body;

	if (!email || !password) {
		res.status(400).json({ message: "Заполните все поля" });
		return;
	}

	const repo = AppDataSource.getRepository(User);
	const user = await repo.findOneBy({ email });

	if (!user) {
		res.status(401).json({ message: "Неверные email или пароль" });
		return;
	}

	if (user.status !== "approved") {
		res.status(403).json({ message: "Ваш аккаунт не подтверждён" });
		return;
	}

	const match = await bcrypt.compare(password, user.passwordHash);
	if (!match) {
		res.status(401).json({ message: "Неверные email или пароль" });
		return;
	}

	const token = jwt.sign(
		{ userId: user.id, role: user.role },
		process.env.JWT_SECRET || "secretkey",
		{ expiresIn: "7d" }
	);

	res.json({ token });
});

router.get("/auth/pending-users", async (_: Request, res: Response) => {
	const repo = AppDataSource.getRepository(User);
	const pendingUsers = await repo.findBy({ status: "pending" });

	res.json(pendingUsers);
});

router.post("/auth/approve/:id", async (req: Request, res: Response) => {
	const repo = AppDataSource.getRepository(User);
	const user = await repo.findOneBy({ id: +req.params.id });

	if (!user) {
		res.status(404).json({ message: "Пользователь не найден" });
		return;
	}

	user.status = "approved";
	await repo.save(user);

	res.json({ message: "Пользователь подтверждён" });
});

router.post("/auth/reject/:id", async (req: Request, res: Response) => {
	const repo = AppDataSource.getRepository(User);
	const user = await repo.findOneBy({ id: +req.params.id });

	if (!user) {
		res.status(404).json({ message: "Пользователь не найден" });
		return;
	}

	user.status = "rejected";
	await repo.save(user);

	res.json({ message: "Пользователь отклонён" });
});

export default router;
