import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}

function writeJson(p, obj) {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(obj, null, 2) + "\n");
}

const enUi = readJson("src/messages/en/ui-en.json");
const enCatalog = readJson("src/messages/en/_catalog.extracted.json");
enUi.marketplace = { ...enUi.marketplace, catalog: enCatalog };
writeJson("src/messages/en/common.json", enUi);
writeJson("public/locales/en/common.json", enUi);

const amUi = readJson("src/messages/am/ui-am.json");
const baseCatalog = readJson("src/messages/en/_catalog.extracted.json");
let patch = {};
try {
  patch = readJson("src/messages/am/catalog-patch.json");
} catch {
  patch = {};
}
const amCatalog = {};
for (const id of Object.keys(baseCatalog)) {
  amCatalog[id] = { ...baseCatalog[id], ...(patch[id] || {}) };
}
amUi.marketplace = { ...amUi.marketplace, catalog: amCatalog };
writeJson("src/messages/am/common.json", amUi);
writeJson("public/locales/am/common.json", amUi);

console.log("Locales assembled.");
