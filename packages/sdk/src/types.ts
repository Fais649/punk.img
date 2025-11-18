export interface PunkImgConfig {
	host?: string;
	port?: number;
}

export interface FileMetadata {
	type: "file";
	name: string;
	filetype: string;
	date_created: string;
	date_updated: string;
	filesize: number;
	href: string;
}

export interface FolderNode {
	type: "directory";
	name: string;
	path: string;
	children: Array<FileMetadata | FolderNode>;
}

export interface ImageTreeResponse {
	root: string;
	items: Array<FileMetadata | FolderNode>;
}


export type ImageFormat =
	| "jpeg"
	| "png"
	| "webp"
	| "avif"
	| "tiff"
	| "gif"
	| "heif"
	| "jpg";

export type FitMode = "cover" | "contain" | "fill" | "inside" | "outside";

export interface ImageRequestOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: ImageFormat;
	fit?: FitMode;
	bg?: string;
}

export interface ImageFetchResult {
	contentType: string;
	blob: Blob;
}

export class PunkImgError extends Error {
	status?: number;

	constructor(message: string, status?: number) {
		super(message);
		this.name = "PunkImgError";
		this.status = status;
	}
}
