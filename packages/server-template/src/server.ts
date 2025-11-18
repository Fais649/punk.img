import Fastify from "fastify";
import fs from "fs/promises";
import path from "path";
import sharp, { type FitEnum } from "sharp";
import type { ImageTreeResponse, FileMetadata, FolderNode, ImageRequestOptions } from "@punk-img/sdk";

const fastify = Fastify({ logger: true });

const IMAGES_DIR = path.resolve("./images");

async function buildTree(
	dir: string,
	base: string = IMAGES_DIR
): Promise<Array<FileMetadata | FolderNode>> {
	const items = await fs.readdir(dir, { withFileTypes: true });
	const result: Array<FileMetadata | FolderNode> = [];

	for (const item of items) {
		const fullPath = path.join(dir, item.name);
		const stats = await fs.stat(fullPath);
		const relativePath = path.relative(base, fullPath);
		const href = `/api/images?path=${encodeURIComponent(
			relativePath.replace(/\\/g, "/")
		)}`;

		if (item.isDirectory()) {
			const node: FolderNode = {
				type: "directory",
				name: item.name,
				path: relativePath,
				children: await buildTree(fullPath, base)
			};
			result.push(node);
		} else {
			const fileNode: FileMetadata = {
				type: "file",
				name: item.name,
				filetype: path.extname(item.name).slice(1),
				date_created: stats.birthtime.toISOString(),
				date_updated: stats.mtime.toISOString(),
				filesize: stats.size,
				href
			};
			result.push(fileNode);
		}
	}

	return result;
}

fastify.get("/api/images/tree", async (request, reply) => {
	const query = request.query as { rootdir?: string };
	const rootdir = query.rootdir
		? path.join(IMAGES_DIR, query.rootdir)
		: IMAGES_DIR;

	try {
		const items = await buildTree(rootdir);
		const response: ImageTreeResponse = {
			root: query.rootdir || "/",
			items
		};
		return response;
	} catch (err: any) {
		reply.code(400);
		return {
			error: "Invalid rootdir or access error.",
			detail: err.message
		};
	}
});

fastify.get("/api/images", async (request, reply) => {
	const query = request.query as { path?: string } & ImageRequestOptions;

	if (!query.path) {
		reply.code(400);
		return { error: "Missing 'path' query parameter." };
	}

	const imagePath = path.join(IMAGES_DIR, query.path);
	const exists = await fs
		.access(imagePath)
		.then(() => true)
		.catch(() => false);

	if (!exists) {
		reply.code(404);
		return { error: "Image not found." };
	}

	const width = query.width ? parseInt(String(query.width)) : undefined;
	const height = query.height ? parseInt(String(query.height)) : undefined;
	const quality = query.quality ? parseInt(String(query.quality)) : 80;
	const format = query.format ? query.format.toLowerCase() : null;

	const availableFormats = Object.keys(sharp.format);
	const fmt = format?.toLowerCase();
	const selectedFormat =
		fmt && availableFormats.includes(fmt === "jpg" ? "jpeg" : fmt)
			? (fmt === "jpg" ? "jpeg" : (fmt as keyof sharp.FormatEnum))
			: null;

	const fitParam = query.fit?.toLowerCase() || "cover";
	const fit: keyof FitEnum =
		Object.values(sharp.fit).includes(fitParam as any)
			? (fitParam as keyof FitEnum)
			: "cover";

	const bg = query.bg || "black";

	let transformer = sharp(imagePath).resize({
		width,
		height,
		fit,
		background: bg
	});

	if (selectedFormat) {
		transformer = transformer.toFormat(
			selectedFormat as keyof sharp.FormatEnum,
			{ quality }
		);
	}

	const buffer = await transformer.toBuffer();
	const contentType = selectedFormat
		? `image/${selectedFormat === "jpg" ? "jpeg" : selectedFormat}`
		: "image/*";

	reply.header("Content-Type", contentType);
	reply.send(buffer);
});

fastify.register(import("@fastify/static"), {
	root: IMAGES_DIR,
	prefix: "/images/"
});

fastify.listen({ port: 3000, host: "0.0.0.0" });
