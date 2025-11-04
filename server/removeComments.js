import fs from "fs";
import path from "path";

const tr = "./src/modules/bundles/routes/modal.routes.js";

function walkThroughDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
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

  const backupPath = `${filePath}.bak`;
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content, "utf8");
  }

  const cleaned = content
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");

  fs.writeFileSync(filePath, cleaned, "utf8");

  console.log(`Cleaned comments from: ${filePath}`);
}

function processTarget(tr) {
  if (!fs.existsSync(tr)) {
    console.error(`Path does not exist: ${tr}`);
    return;
  }

  const stat = fs.statSync(tr);
  if (stat.isFile()) {
    removeCommentsFromFile(tr);
  } else if (stat.isDirectory()) {
    walkThroughDir(tr, removeCommentsFromFile);
  } else {
    console.error(`Unsupported path type: ${tr}`);
  }
}

processTarget(tr);
console.log("Done removing comments!");
