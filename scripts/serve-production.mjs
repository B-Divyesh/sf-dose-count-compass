import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve("dist");
const config = JSON.parse(
  await readFile(resolve(root, "staticwebapp.config.json"), "utf8"),
);
const headers = config.globalHeaders ?? {};
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname,
    );
    const candidate = resolve(root, `.${pathname}`);
    if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
      response.writeHead(400).end("Bad request");
      return;
    }

    let file = candidate;
    try {
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      await stat(file);
    } catch {
      file = resolve(root, "index.html");
    }

    response.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      ...headers,
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(500).end("Server error");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Production build with deployment headers: http://127.0.0.1:${port}`);
});
