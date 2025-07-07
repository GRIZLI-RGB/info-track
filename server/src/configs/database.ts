import {
	CreateDateColumn,
	DataSource,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity as BE,
} from "typeorm";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	entities:
		process.env.MODE === "development"
			? ["src/models/**/*.model.ts"]
			: ["dist/models/**/*.model.js"],
	subscribers: [],
	migrations: [],
	logging: ["error", "warn"],
	logger: "simple-console",
	maxQueryExecutionTime: 1000,
	synchronize: true,
	dropSchema: false,
	applicationName: "info-track",
});

export abstract class BaseEntity extends BE {
	@PrimaryGeneratedColumn()
	id!: number;

	@CreateDateColumn()
	created_at!: Date;

	@UpdateDateColumn()
	updated_at!: Date;
}

export default AppDataSource.initialize()
	.then(() => console.log("[DATABASE]: [OK]"))
	.catch((e) => console.log(`[DATABASE]: ${e}`));
