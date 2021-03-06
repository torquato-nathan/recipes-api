interface Error {
	statusCode: number;
}

declare namespace NodeJS {
	export interface ProcessEnv {
		PORT: string;
		EXPOSED_PORT: string;
		RECIPE_PUPPY_API_URL: string;
		GIF_PUPPY_API_URL: string;
		GIF_API_KEY: string;
		GIF_NOT_FOUND_URL: string;
	}
}
