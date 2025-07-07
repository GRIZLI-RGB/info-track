import dotenv from "dotenv";

export default (async () => {
	dotenv.config({
		path: ".env",
	});
})()
	.then(() => console.log("[ENV]: [OK]"))
	.catch(() => console.log("[ENV]: [ERROR]"));
