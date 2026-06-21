import fs from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const distDirectory = path.join(process.cwd(), "dist");
fs.mkdirSync(distDirectory, { recursive: true });

fs.writeFileSync(
  path.join(distDirectory, "health.json"),
  JSON.stringify({ status: "UP" }, null, 2) + "\n",
);

fs.writeFileSync(
  path.join(distDirectory, "info.json"),
  JSON.stringify({ version: packageJson.version }, null, 2) + "\n",
);
