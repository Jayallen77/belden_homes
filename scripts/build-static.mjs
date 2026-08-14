import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const client = join(dist, "client");
const server = join(dist, "server");

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && (entry.name.endsWith(".html") || entry.name === "sitemap.txt")) {
    await cp(join(root, entry.name), join(client, entry.name));
  }
}

for (const directory of ["assets", "data", "homes"]) {
  await cp(join(root, directory), join(client, directory), { recursive: true });
}

await cp(join(root, "worker", "index.js"), join(server, "index.js"));

console.log("Built Belden Homes static site for Sites hosting.");
