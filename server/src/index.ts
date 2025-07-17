import express from "express";
import cors from "cors";

import env from "./configs/env";
import database from "./configs/database";

import router from "./routes";

import "reflect-metadata";

const app = express();

app.use(
	cors({
		origin:
			process.env.MODE === "development" ? "http://localhost:3000" : "*",
	})
);

app.use(express.json());

app.use("/api", router);

const startServer = async () => {
	await env;
	await database;

	app.listen(process.env.SERVER_PORT, () => console.log("[SERVER]: [OK]"));
};

startServer();
