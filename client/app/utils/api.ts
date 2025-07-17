import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
	baseURL:
		process.env.NODE_ENV === "development"
			? "http://localhost:8000/api/"
			: "http://localhost:8000/api/",
});

api.interceptors.request.use(
	(config) => {
		const token =
			typeof window !== "undefined" && window.localStorage
				? localStorage.getItem("token")
				: null;

		if (token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
