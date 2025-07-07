import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const routersPath = path.join(__dirname, "../routes");

const loadRoutes = () => {
	const files = fs.readdirSync(routersPath);
	for (const file of files) {
		if (
			file.endsWith(
				process.env.MODE === "development" ? ".router.ts" : ".router.js"
			)
		) {
			const filePath = path.join(routersPath, file);
			const route = require(filePath);
			router.use(route.default || route);
		}
	}
};

loadRoutes();

export default router;
