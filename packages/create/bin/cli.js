#!/usr/bin/env node
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import prompts from "prompts";
import { execSync } from "child_process";
import degit from "degit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
	const { projectName } = await prompts({
		type: "text",
		name: "projectName",
		message: "Project name:",
		initial: "punk-img-app"
	});

	if (!projectName) {
		console.error("Aborted — project name required.");
		process.exit(1);
	}

	const targetDir = path.resolve(process.cwd(), projectName);
	if (fs.existsSync(targetDir)) {
		console.error(`❌ Directory "${projectName}" already exists.`);
		process.exit(1);
	}

	console.log(`✨ Creating ${projectName}...`);

	const repo = "fais649/punk-img/packages/server";
	console.log(`📥 Cloning starter from https://github.com/${repo} ...`);

	const emitter = degit(repo, { cache: false, force: true });
	await emitter.clone(targetDir);

	// Write sensible .env defaults
	const envContent = `PUNK_IMG_HOST=http://localhost
PUNK_IMG_PORT=3000
`;
	await fs.writeFile(path.join(targetDir, ".env"), envContent);

	const pkgPath = path.join(targetDir, "package.json");
	if (await fs.pathExists(pkgPath)) {
		const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
		pkg.name = projectName;
		delete pkg.private;
		delete pkg.version;
		await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
	}

	console.log("\n📦 Installing dependencies (this may take a moment)...");
	execSync("bun install", { cwd: targetDir, stdio: "inherit" });

	console.log(`
✅ All done!

Next steps:

  cd ${projectName}
  bun run dev

Your Punk‑Img server is ready at http://localhost:3000
`);
}

main().catch((err) => {
	console.error("🚨 Failed to create project:", err.message);
	process.exit(1);
});
