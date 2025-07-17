import { atom } from "jotai";

import { User } from "./types";

type UserState = {
	data: User | null;
	loading: boolean;
	error: string | null;
};

export const userAtom = atom<UserState>({
	data: null,
	loading: true,
	error: null,
});
