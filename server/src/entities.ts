import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "./configs/database";

@Entity()
export class User extends BaseEntity {
	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ default: false })
	isVerified: boolean;

	@Column({ default: false })
	isAdmin: boolean;

	@OneToMany(() => ChannelAdmin, (admin) => admin.user)
	adminChannels: ChannelAdmin[];

	@OneToMany(() => UserChannel, (userChannel) => userChannel.user)
	channels: UserChannel[];

	@OneToMany(() => NewsResponse, (response) => response.user)
	responses: NewsResponse[];
}

@Entity()
export class Channel extends BaseEntity {
	@Column()
	name: string;

	@Column()
	description: string;

	@OneToMany(() => ChannelAdmin, (admin) => admin.channel)
	admins: ChannelAdmin[];

	@OneToMany(() => UserChannel, (userChannel) => userChannel.channel)
	users: UserChannel[];

	@OneToMany(() => News, (news) => news.channel)
	news: News[];
}

@Entity()
export class ChannelAdmin extends BaseEntity {
	@ManyToOne(() => User, (user) => user.adminChannels)
	user: User;

	@ManyToOne(() => Channel, (channel) => channel.admins)
	channel: Channel;
}

@Entity()
export class UserChannel extends BaseEntity {
	@ManyToOne(() => User, (user) => user.channels)
	user: User;

	@ManyToOne(() => Channel, (channel) => channel.users)
	channel: Channel;
}

@Entity()
export class News extends BaseEntity {
	@Column()
	title: string;

	@Column("text")
	content: string;

	@Column({ type: "timestamp" })
	startDate: Date;

	@Column({ type: "timestamp" })
	endDate: Date;

	@ManyToOne(() => Channel, (channel) => channel.news)
	channel: Channel;

	@OneToMany(() => Question, (question) => question.news)
	questions: Question[];

	@OneToMany(() => NewsResponse, (response) => response.news)
	responses: NewsResponse[];
}

@Entity()
export class Question extends BaseEntity {
	@Column()
	text: string;

	@Column({ type: "json" })
	options: string[];

	@Column()
	type: "text" | "radio" | "checkbox" | "select";

	@ManyToOne(() => News, (news) => news.questions)
	news: News;
}

@Entity()
export class NewsResponse extends BaseEntity {
	@ManyToOne(() => User, (user) => user.responses)
	user: User;

	@ManyToOne(() => News, (news) => news.responses)
	news: News;

	@Column({ type: "json" })
	answers: Record<string, string | string[]>;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	responseDate: Date;
}
