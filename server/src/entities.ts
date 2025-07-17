// import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

// import { BaseEntity } from "./configs/database";

// @Entity()
// export class User extends BaseEntity {
// 	@Column()
// 	name: string;

// 	@Column({ unique: true })
// 	email: string;

// 	@Column()
// 	password: string;

// 	@Column({ default: false })
// 	isVerified: boolean;

// 	@Column({ default: false })
// 	isAdmin: boolean;

// 	@OneToMany(() => ChannelAdmin, (admin) => admin.user)
// 	adminChannels: ChannelAdmin[];

// 	@OneToMany(() => UserChannel, (userChannel) => userChannel.user)
// 	channels: UserChannel[];

// 	@OneToMany(() => NewsResponse, (response) => response.user)
// 	responses: NewsResponse[];
// }

// @Entity()
// export class Channel extends BaseEntity {
// 	@Column()
// 	name: string;

// 	@Column()
// 	description: string;

// 	@OneToMany(() => ChannelAdmin, (admin) => admin.channel)
// 	admins: ChannelAdmin[];

// 	@OneToMany(() => UserChannel, (userChannel) => userChannel.channel)
// 	users: UserChannel[];

// 	@OneToMany(() => News, (news) => news.channel)
// 	news: News[];
// }

// @Entity()
// export class ChannelAdmin extends BaseEntity {
// 	@ManyToOne(() => User, (user) => user.adminChannels)
// 	user: User;

// 	@ManyToOne(() => Channel, (channel) => channel.admins)
// 	channel: Channel;
// }

// @Entity()
// export class UserChannel extends BaseEntity {
// 	@ManyToOne(() => User, (user) => user.channels)
// 	user: User;

// 	@ManyToOne(() => Channel, (channel) => channel.users)
// 	channel: Channel;
// }

// @Entity()
// export class News extends BaseEntity {
// 	@Column()
// 	title: string;

// 	@Column("text")
// 	content: string;

// 	@Column({ type: "timestamp" })
// 	startDate: Date;

// 	@Column({ type: "timestamp" })
// 	endDate: Date;

// 	@ManyToOne(() => Channel, (channel) => channel.news)
// 	channel: Channel;

// 	@OneToMany(() => Question, (question) => question.news)
// 	questions: Question[];

// 	@OneToMany(() => NewsResponse, (response) => response.news)
// 	responses: NewsResponse[];
// }

// @Entity()
// export class Question extends BaseEntity {
// 	@Column()
// 	text: string;

// 	@Column({ type: "json" })
// 	options: string[];

// 	@Column()
// 	type: "text" | "radio" | "checkbox" | "select";

// 	@ManyToOne(() => News, (news) => news.questions)
// 	news: News;
// }

// @Entity()
// export class NewsResponse extends BaseEntity {
// 	@ManyToOne(() => User, (user) => user.responses)
// 	user: User;

// 	@ManyToOne(() => News, (news) => news.responses)
// 	news: News;

// 	@Column({ type: "json" })
// 	answers: Record<string, string | string[]>;

// 	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
// 	responseDate: Date;
// }

import {
	Entity,
	Column,
	ManyToOne,
	OneToMany,
	JoinColumn,
	Unique,
	CreateDateColumn,
} from "typeorm";
import { BaseEntity } from "./configs/database";

@Entity()
export class User extends BaseEntity {
	@Column()
	fio: string;

	@Column({ unique: true })
	email: string;

	@Column()
	passwordHash: string;

	@Column({ default: "user" })
	role: "admin" | "user";

	@Column({ default: "pending" })
	status: "pending" | "approved" | "rejected";
}

@Entity()
export class Channel extends BaseEntity {
	@Column()
	name: string;

	@ManyToOne(() => User)
	admin: User;

	@OneToMany(() => ChannelUser, (cu) => cu.channel)
	channelUsers: ChannelUser[];
}

@Entity()
export class ChannelUser extends BaseEntity {
	@ManyToOne(() => Channel, (c) => c.channelUsers, { onDelete: "CASCADE" })
	@JoinColumn()
	channel: Channel;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn()
	user: User;
}

@Entity()
export class News extends BaseEntity {
	@Column()
	title: string;

	@Column("text")
	content: string;

	@Column({ type: "timestamp with time zone" })
	startsAt: Date;

	@Column({ type: "timestamp with time zone", nullable: true })
	endsAt: Date | null;

	@ManyToOne(() => Channel)
	channel: Channel;

	@ManyToOne(() => User)
	author: User;
}

@Entity()
@Unique(["user", "news"])
export class NewsConfirmation extends BaseEntity {
	@ManyToOne(() => User, { eager: true })
	user: User;

	@ManyToOne(() => News, { eager: true })
	news: News;

	@CreateDateColumn()
	confirmedAt: Date;
}
