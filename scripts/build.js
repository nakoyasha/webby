const fs = require("fs")

fs.cpSync("src/server/data", "dist/src/server/data", { recursive: true })
fs.cpSync("src/server/views", "dist/src/server/views", { recursive: true })