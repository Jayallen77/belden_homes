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
  if (entry.isFile() && (entry.name.endsWith(".html") || ["sitemap.xml", "robots.txt"].includes(entry.name))) {
    await cp(join(root, entry.name), join(client, entry.name));
  }
}

for (const directory of ["assets/css", "assets/js", "assets/models", "homes"]) {
  await cp(join(root, directory), join(client, directory), { recursive: true });
}
await mkdir(join(client, "assets/img"), {recursive:true});
await cp(join(root,"assets/img/belden-logo-transparent.png"),join(client,"assets/img/belden-logo-transparent.png"));

await cp(join(root, "worker", "index.js"), join(server, "index.js"));

console.log("Built Belden Homes public assets and compatibility worker.");
