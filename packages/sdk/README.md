# @punk-img/sdk

A lightweight, type‑safe SDK for interacting with the **Punk‑Img** server API.

This package makes it easy to fetch image metadata trees, request dynamically processed images, and integrate Punk‑Img into your applications (Node, Bun, or browser).

---

## 🚀 Installation

```bash
bun add @punk-img/sdk
# or
npm install @punk-img/sdk
# or
pnpm add @punk-img/sdk
```

---

## 🧩 Basic Usage

```ts
import { PunkImgClient } from "@punk-img/sdk";

const client = new PunkImgClient({
  host: "http://localhost", // Punk‑Img server host
  port: 3000                // Optional, defaults to 3000
});

// Fetch folder/file tree
const tree = await client.getImageTree();
console.log(tree.items);

// Fetch a resized image
const blob = await client.getImage("art/spooky.png", {
  width: 800,
  format: "webp",
  quality: 80
});
```

---

## ⚙️ Configuration

The SDK looks for configuration either from the constructor or from environment variables *(server‑side usage only)*.

| Option | Env | Default | Description |
|--------|-----|----------|-------------|
| `host` | `PUNK_IMG_HOST` | `"http://localhost"` | Base host of the Punk‑Img server |
| `port` | `PUNK_IMG_PORT` | `3000` | Port on which the server runs |

Example (.env file at project root):

```bash
PUNK_IMG_HOST=https://img.punk.dev
PUNK_IMG_PORT=8080
```

---

## 🌐 API Overview

### `getImageTree(rootdir?: string)`

Fetches a recursive JSON tree of available images and subfolders.

**Returns**
```ts
type ImageTreeResponse = {
  root: string;
  items: Array<FileMetadata | FolderNode>;
};
```

**Example**
```ts
const tree = await client.getImageTree("art");
console.log(tree);
```

---

### `getImage(path: string, options?: ImageRequestOptions)`

Fetch a processed image from the server.

```ts
const blob = await client.getImage("art/spooky.png", {
  width: 600,
  height: 400,
  fit: "cover",
  format: "webp",
  quality: 80,
  bg: "transparent"
});
```

Returns a `Blob` object.  
Convert it to a local URL or display directly:

```ts
const url = URL.createObjectURL(blob);
document.querySelector("img")!.src = url;
```

---

### `getImageDataUrl(path: string, options?: ImageRequestOptions)`

Returns the same image as a base64 `data:` URL (for quick previews):

```ts
const dataUrl = await client.getImageDataUrl("art/spooky.png", {
  width: 400,
  format: "jpeg"
});
```

---

## 🧠 Type Safety

All methods in this SDK are fully typed and validated.  
You get autocompletion and compile‑time checking for all supported options:

```ts
const opts: ImageRequestOptions = {
  format: "webp",
  fit: "contain",
  bg: "white"
};
```

---

## 💻 Environment‑Aware

The SDK automatically detects its runtime:

- **Server / SSR** → reads `PUNK_IMG_HOST` and `PUNK_IMG_PORT` env vars  
- **Browser** → uses relative API paths (`/api/images`) and never references env vars

---

## 🔗 Example Integration with @punk-img/server

If you are using the official Punk‑Img server package:

```ts
import Fastify from "fastify";
import { PunkImgClient } from "@punk-img/sdk";

const fastify = Fastify({ logger: true });

// Instantiate SDK to access image metadata internally
const client = new PunkImgClient({
  host: "http://localhost",
  port: 3000
});

fastify.get("/custom/images", async () => {
  return await client.getImageTree();
});

fastify.listen({ port: 3000 });
```

---

## 🧰 Development

To install dependencies:

```bash
bun install
```

To build the SDK:

```bash
bun run build
```

To run manually for testing:

```bash
bun run dist/index.js
```

---

## 📝 License

MIT © Punk‑Img contributors
