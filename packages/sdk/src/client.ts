import { type PunkImgConfig, PunkImgError, type ImageTreeResponse } from "./types";
import { getDefaultConfig } from "./config";

export class PunkImgClient {
	private config: PunkImgConfig;
	private isServer: boolean;

	constructor(config?: PunkImgConfig) {
		this.config = { ...getDefaultConfig(), ...config };
		this.isServer = typeof window === "undefined";
	}

	private buildBaseUrl(): string {
		if (this.isServer && this.config.host && this.config.port) {
			return `${this.config.host}:${this.config.port}/api/images`;
		}
		// In browser, assume API routes are relative
		return "/api/images";
	}

	async getImageTree(rootdir?: string): Promise<ImageTreeResponse> {
		const url = new URL(`${this.buildBaseUrl()}/tree`);
		if (rootdir) url.searchParams.set("rootdir", rootdir);

		const res = await fetch(url.toString());

		if (!res.ok) throw new PunkImgError(`Failed to fetch image tree: ${res.statusText}`);
		return await res.json();
	}

	async getImage(path: string, params?: Record<string, string | number>): Promise<Blob> {
		const url = new URL(this.buildBaseUrl());
		url.searchParams.set("path", path);
		for (const [k, v] of Object.entries(params || {})) {
			url.searchParams.set(k, String(v));
		}

		const res = await fetch(url.toString());
		if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);

		return await res.blob();
	}
}
