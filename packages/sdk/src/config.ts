import { PunkImgConfig } from "./types";

export const getDefaultConfig = (): PunkImgConfig => {
	return {
		host: process.env.PUNK_IMG_HOST || "http://localhost",
		port: (process.env.PUNK_IMG_PORT || "3000", 10),
	};
};
