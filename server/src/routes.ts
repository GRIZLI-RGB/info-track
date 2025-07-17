import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AppDataSource } from "./configs/database";
import { Channel, ChannelUser, News, NewsConfirmation, User } from "./entities";
import { In, IsNull, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

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

router.get("/news/feed", async (req: Request, res: Response) => {
	const userId = req.query.userId as string;

	if (!userId) {
		res.status(400).json({ message: "userId обязателен" });
		return;
	}

	const cuRepo = AppDataSource.getRepository(ChannelUser);
	const channelIds = await cuRepo.find({
		where: { user: { id: +userId } },
		relations: ["channel"],
	});

	const ids = channelIds.map((cu) => cu.channel.id);
	if (ids.length === 0) {
		res.json([]);
		return;
	}

	const now = new Date();

	const newsList = await AppDataSource.getRepository(News).find({
		where: [
			{
				channel: { id: In(ids) },
				startsAt: LessThanOrEqual(now),
				endsAt: IsNull(),
			},
			{
				channel: { id: In(ids) },
				startsAt: LessThanOrEqual(now),
				endsAt: MoreThanOrEqual(now),
			},
		],
		relations: ["author", "channel"],
		order: { startsAt: "DESC" },
	});

	res.json(
		newsList.map((n) => ({
			id: n.id,
			title: n.title,
			content: n.content,
			startsAt: n.startsAt,
			channel: { id: n.channel.id, name: n.channel.name },
			author: { id: n.author.id, fio: n.author.fio },
		}))
	);
});

router.post("/news/:id/confirm", async (req: Request, res: Response) => {
	const userId = req.body.userId;
	const newsId = req.params.id;

	const repo = AppDataSource.getRepository(NewsConfirmation);

	// Проверка на дубликат
	const existing = await repo.findOne({
		where: { user: { id: +userId }, news: { id: +newsId } },
	});

	if (existing) {
		res.status(400).json({ message: "Уже подтверждено" });
		return;
	}

	const userRepo = AppDataSource.getRepository(User);
	const newsRepo = AppDataSource.getRepository(News);

	const user = await userRepo.findOneBy({ id: +userId });
	const news = await newsRepo.findOneBy({ id: +newsId });

	if (!user || !news) {
		res.status(404).json({ message: "Not found" });
		return;
	}

	const confirm = repo.create({ user, news });
	await repo.save(confirm);

	res.status(201).json({ message: "Ознакомление подтверждено" });
});

router.get("/news/:id/stats", async (req: Request, res: Response) => {
	const newsId = req.params.id;

	const repo = AppDataSource.getRepository(NewsConfirmation);
	const all = await repo.find({ where: { news: { id: +newsId } } });

	res.json({ count: all.length });
});

router.get("/news/:id", async (req: Request, res: Response) => {
	const newsId = req.params.id;

	if (!newsId) {
		res.status(400).json({ message: "ID не указан" });
		return;
	}

	const repo = AppDataSource.getRepository(News);

	const news = await repo.findOne({
		where: { id: +newsId },
		relations: ["author", "channel"],
	});

	if (!news) {
		res.status(404).json({ message: "Новость не найдена" });
		return;
	}

	res.json({
		id: news.id,
		title: news.title,
		content: news.content,
		startsAt: news.startsAt,
		endsAt: news.endsAt,
		channel: {
			id: news.channel.id,
			name: news.channel.name,
		},
		author: {
			id: news.author.id,
			fio: news.author.fio,
		},
	});
});

router.get("/news/:id/confirm-status", async (req: Request, res: Response) => {
	const newsId = +req.params.id;
	const userId = +req.query.userId!;

	if (!newsId || !userId) {
		res.status(400).json({
			message: "ID пользователя и новости обязательны",
		});
		return;
	}

	const repo = AppDataSource.getRepository(NewsConfirmation);

	const existing = await repo.findOne({
		where: { user: { id: userId }, news: { id: newsId } },
	});

	res.json({ confirmed: !!existing });
});

router.get("/users/:id/rating", async (req: Request, res: Response) => {
	const userId = +req.params.id;

	// 1. Получаем каналы пользователя
	const cuRepo = AppDataSource.getRepository(ChannelUser);
	const channels = await cuRepo.find({
		where: { user: { id: userId } },
		relations: ["channel"],
	});
	const channelIds = channels.map((cu) => cu.channel.id);

	if (channelIds.length === 0) {
		res.json({ total: 0, confirmed: 0, percentage: 0 });
		return;
	}

	// 2. Получаем все доступные новости
	const now = new Date();
	const newsRepo = AppDataSource.getRepository(News);
	const newsList = await newsRepo.find({
		where: [
			{
				channel: { id: In(channelIds) },
				startsAt: LessThanOrEqual(now),
				endsAt: IsNull(),
			},
			{
				channel: { id: In(channelIds) },
				startsAt: LessThanOrEqual(now),
				endsAt: MoreThanOrEqual(now),
			},
		],
	});
	const total = newsList.length;

	// 3. Получаем все подтверждения пользователя
	const confirmRepo = AppDataSource.getRepository(NewsConfirmation);
	const confirmed = await confirmRepo.count({
		where: {
			user: { id: userId },
			news: { id: In(newsList.map((n) => n.id)) },
		},
	});

	const percentage = total === 0 ? 0 : Math.round((confirmed / total) * 100);

	res.json({ total, confirmed, percentage });
});

export default router;
