import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AppDataSource } from "./configs/database";
import { Channel, ChannelUser, News, User } from "./entities";

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

router.post("/channels", async (req: Request, res: Response) => {
	const { name, adminId, userIds } = req.body;

	if (!name || !adminId || !Array.isArray(userIds)) {
		res.status(400).json({ message: "Неверные параметры" });
		return;
	}

	const userRepo = AppDataSource.getRepository(User);
	const admin = await userRepo.findOneBy({ id: adminId });

	if (!admin) {
		res.status(404).json({ message: "Администратор не найден" });
		return;
	}

	const channelRepo = AppDataSource.getRepository(Channel);
	const channel = channelRepo.create({ name, admin });
	await channelRepo.save(channel);

	const cuRepo = AppDataSource.getRepository(ChannelUser);
	for (const userId of userIds) {
		const user = await userRepo.findOneBy({ id: userId });
		if (user) {
			const cu = cuRepo.create({ user, channel });
			await cuRepo.save(cu);
		}
	}

	res.status(201).json({ message: "Канал создан" });
});

router.get("/users/approved", async (_: Request, res: Response) => {
	const users = await AppDataSource.getRepository(User).findBy({
		status: "approved",
	});

	res.json(users);
});

router.post("/news", async (req: Request, res: Response) => {
	const { title, content, channelId, startsAt, endsAt, authorId } = req.body;

	if (!title || !content || !channelId || !startsAt || !authorId) {
		res.status(400).json({ message: "Необходимые поля не заполнены" });
		return;
	}

	const channelRepo = AppDataSource.getRepository(Channel);
	const authorRepo = AppDataSource.getRepository(User);
	const newsRepo = AppDataSource.getRepository(News);

	const channel = await channelRepo.findOneBy({ id: channelId });
	const author = await authorRepo.findOneBy({ id: authorId });

	if (!channel || !author) {
		res.status(404).json({ message: "Канал или автор не найден" });
		return;
	}

	const news = newsRepo.create({
		title,
		content,
		channel,
		author,
		startsAt: new Date(startsAt),
		endsAt: endsAt ? new Date(endsAt) : null,
	}) as Partial<News>;

	await newsRepo.save(news);

	res.status(201).json({ message: "Новость опубликована" });
});

router.get("/news", async (req: Request, res: Response) => {
	const { channelId } = req.query;

	if (!channelId) {
		res.status(400).json({ message: "Укажите ID канала" });
		return;
	}

	const newsList = await AppDataSource.getRepository(News).find({
		where: {
			channel: { id: +channelId },
		},
		relations: ["author"],
		order: {
			startsAt: "DESC",
		},
	});

	res.json(newsList);
});

router.get("/auth/me", async (req: Request, res: Response) => {
	const auth = req.headers.authorization;

	if (!auth || !auth.startsWith("Bearer ")) {
		res.status(401).json({ message: "Нет токена" });
		return;
	}

	const token = auth.replace("Bearer ", "");
	let decoded: any;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
	} catch {
		res.status(401).json({ message: "Невалидный токен" });
		return;
	}

	const user = await AppDataSource.getRepository(User).findOneBy({
		id: decoded.userId,
	});

	if (!user) {
		res.status(404).json({ message: "Пользователь не найден" });
		return;
	}

	res.json(user);
});

export default router;
