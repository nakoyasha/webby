const fs = require("fs");

fs.cpSync("data", "dist/src/server/data", { recursive: true });
fs.cpSync("views", "dist/src/server/views", { recursive: true });
