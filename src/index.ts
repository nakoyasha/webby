import express from "express"
import child_process from "child_process"
const server = express()

const BUILD_ID = child_process
    .execSync('git rev-parse HEAD')
    .toString().trim() || "dev"
const BUILD_DATE = new Date(Date.now()).toString()



server.use((request, response, nextConsumer) => {
    response.set("X-Powered-By", "menhera")
    nextConsumer()
})

server.use(express.static("public"))
server.set("view engine", "ejs")

server.get("/", (req, res) => {
    res.render('index', { build_id: BUILD_ID, build_date: BUILD_DATE, page: "home" })
})

server.get("/projects", (req, res) => {
    res.render('index', { build_id: BUILD_ID, build_date: BUILD_DATE, page: "projects" })
})

server.get("/*", (req, res) => {
    res.render('index', { build_id: BUILD_ID, build_date: BUILD_DATE, page: "404", evil: "evil-evil-div" })
})

server.listen(3000, () => {
    console.log("silly webiste is listening on port 3000!")
})