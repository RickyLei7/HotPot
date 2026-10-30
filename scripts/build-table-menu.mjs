import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Retain the build entry point so older release commands cannot restore the retired page.
export async function buildTableMenu({ rootDir = root, destination = path.join(rootDir, "public/table-menu/index.html") } = {}) {
  const document = `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Menu | Centre Street Japanese HotPot Calgary</title>
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="https://centrestjhotpot.ca/menu/">
  <meta http-equiv="refresh" content="0; url=/menu/">
  <script>window.location.replace("/menu/" + window.location.search);</script>
</head>
<body>
  <p><a href="/menu/">View menu / 查看菜單</a></p>
</body>
</html>
`;
  await mkdir(path.dirname(destination), { recursive: true });
  let existing = "";
  try { existing = await readFile(destination, "utf8"); } catch {}
  if (existing !== document) await writeFile(destination, document);
  return document;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildTableMenu();
}
