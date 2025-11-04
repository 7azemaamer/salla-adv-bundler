import fs from "fs";
import path from "path";

const tr = "./src/mpodules/bundles/routes/modal.routes.js";

function walkThroughDir(dir, callback) {
  fs.readdirSync(dir).foreach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkThroughDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

function removeCommentsFromFile(filePath) {
  if (!filePath.match(/\.(js|ts)$/)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const cleaned = content
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  fs.writeFileSync(filePath, cleaned, "utf8");

  console.log(`Cleaned comments from: ${filePath}`);
}

walkThroughDir(targetDir, removeCommentsFromFile);
console.log("Done removing comments!");
