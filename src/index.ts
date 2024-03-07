import express, { Response, json } from "express"
import child_process from "child_process"
import { join } from "path"
const server = express()

import { writeFileSync, readFileSync, readdirSync } from "fs"
import matter, { read } from "gray-matter"
import ejs from "ejs"
import highlightjs from "highlight.js"

import markdown from "markdown-it"
import { render } from "pug"

export type PostMetadata = {
    name: string,
    title: string,
    description: string,
    content: string,
    date: string,
}

// CAUTION! very dangerous and scary git command ahead..
// const BUILD_ID = child_process
//     .execSync('git rev-parse --short HEAD')
//     .toString().trim() || "dev"
const BUILD_ID = "infdev"
const BUILD_DATE = new Date(Date.now()).toString()

const VIEWS_LOCATION = join(__dirname, "server/views")
const DATA_LOCATION = join(__dirname, "server/data")
const POSTS_LOCATION = join(__dirname, "server/data/posts")

function renderNotFound(res: Response) {
    res.render("index", {
        build_id: BUILD_ID,
        build_date: BUILD_DATE,
        page: "404",
    })
}

function getPostMetadata(file: string): PostMetadata {
    const metadata = matter.read(POSTS_LOCATION + `/${file}`)

    return {
        name: file.replace(".md", ""),
        title: metadata.data.title,
        description: metadata.data.description,
        content: metadata.content,
        date: metadata.data.date,
    }
}


server.use((_, response, nextConsumer) => {
    response.set("X-Powered-By", "menhera")
    nextConsumer()
})

server.use(express.static("src/server/data"))
server.use(express.static("public"))

// 
server.set("views", join(__dirname, "server/views"))
server.set("view engine", "ejs")

server.get("/", async (req, res) => {
    const meData = JSON.parse(readFileSync(DATA_LOCATION + "/me.json", { encoding: "utf8", flag: "r" }))
    // writeFileSync(`build/index.html`, await ejs.renderFile(VIEWS_LOCATION + '/index.ejs', {
    //     build_id: BUILD_ID,
    //     build_date: BUILD_DATE,
    //     page: "home",
    //     my: meData
    // }))
    res.render('index', { build_id: BUILD_ID, build_date: BUILD_DATE, page: "home", my: meData })
})

server.get("/sekai-stickers", async (req, res) => {
    res.render('index', { build_id: BUILD_ID, build_date: BUILD_DATE, page: "sekaiStickers" })
})

server.get("/projects", async (req, res) => {
    // writeFileSync(`build/projects.html`, await ejs.renderFile(VIEWS_LOCATION + '/index.ejs', {
    //     build_id: BUILD_ID,
    //     build_date: BUILD_DATE,
    //     page: "projects",
    // }))
    res.render('index', { build_id: BUILD_ID, build_date: BUILD_DATE, page: "projects" })
})

server.get("/blog", async (req, res) => {
    const posts = [] as PostMetadata[]
    const markdownFiles = readdirSync(POSTS_LOCATION).filter((post) => post.endsWith(".md"))

    await markdownFiles.forEach((file) => {
        posts.push(getPostMetadata(file))
    })

    // writeFileSync(`build/blog/index.html`, await ejs.renderFile(VIEWS_LOCATION + '/index.ejs', {
    //     build_id: BUILD_ID,
    //     build_date: BUILD_DATE,
    //     page: "blog",
    //     posts: posts
    // }))

    res.render('index', {
        build_id: BUILD_ID,
        build_date: BUILD_DATE,
        page: "blog",
        posts: posts
    })
})

server.get("/blog/:blogId", async (req, res) => {
    const blogId = req.params.blogId
    const md = markdown({
        html: true,
        langPrefix: "hljs language-",

        highlight: function (str, lang) {
            if (lang && highlightjs.getLanguage(lang)) {
                try {
                    return highlightjs.highlight(str, { language: lang }).value;
                } catch (__) { }
            }

            return ''; // use external default escaping
        }
    })

    try {
        const post = getPostMetadata(`${blogId}.md`)
        const renderedContent = md.render(post.content)
        post.content = renderedContent

        // writeFileSync(`build/blog/${blogId}`, await ejs.renderFile(VIEWS_LOCATION + '/index.ejs', {
        //     build_id: BUILD_ID,
        //     build_date: BUILD_DATE,
        //     page: "blogPost",
        //     post: post,
        // }))

        res.render('index', {
            build_id: BUILD_ID,
            build_date: BUILD_DATE,
            page: "blogPost",
            post: post,
        })
    } catch (err) {
        console.log(`: ${err}`)
        renderNotFound(res)
    }
})

server.get("/*", (req, res) => {
    res.status(404)

    if (req.accepts("html")) {
        renderNotFound(res)
    } else {
        res.send({
            message: "404 - page not found"
        })
    }
})


server.listen(80, () => {
    console.log("silly website is listening on port 80!")
})