import express, { Response } from "express"
import { join } from "path"

import { readFileSync, readdirSync } from "fs"
import matter from "gray-matter"
import highlightjs from "highlight.js"

import markdown from "markdown-it"
import { rateLimit } from 'express-rate-limit'
import { database } from "@system/database"

export type PostMetadata = {
    name: string,
    title: string,
    description: string,
    content: string,
    date: string,
}

export type BuildMetadata = {
    name: string,
    title: string,
    description: string,
    date: string,
}

export const server = {
    server: express(),
    DATA_LOCATION: join(__dirname, "data"),
    POSTS_LOCATION: join(__dirname, "data/posts"),

    renderNotFound: function (res: Response) {
        res.render("index", {
            page: "404",
        })
    },

    getPostMetadata: function (file: string): PostMetadata {
        const metadata = matter.read(this.POSTS_LOCATION + `/${file}`)

        return {
            name: file.replace(".md", ""),
            title: metadata.data.title,
            description: metadata.data.description,
            content: metadata.content,
            date: metadata.data.date,
        }
    },

    fetchedBuilds: null as BuildMetadata[] | null,
    lastBuildFetch: Date.now(),

    limiter: rateLimit({
        windowMs: 60000, // 1 minute per 25 requests
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
        standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
        legacyHeaders: true,

    }),
    init: function () {
        this.server.use((_, response, nextConsumer) => {
            response.set("X-Powered-By", "menhera")
            nextConsumer()
        })

        this.server.use(express.static("src/server/data"))
        this.server.use(express.static("public"))

        this.server.set("views", join(__dirname, "views"))
        this.server.set("view engine", "ejs")

        this.server.get("/", async (req, res) => {
            const meData = JSON.parse(readFileSync(this.DATA_LOCATION + "/me.json", { encoding: "utf8", flag: "r" }))
            res.render('index', {
                page: "home", my: meData
            })
        })

        this.server.get("/sekai-stickers", async (req, res) => {
            res.render('index', {
                page: "sekaiStickers"
            })
        })

        this.server.get("/projects", async (req, res) => {
            res.render('index', {
                page: "projects"
            })
        })

        this.server.get("/trackers", async (req, res) => {
            res.render('index', {
                page: "trackers",
            })
        })

        this.server.get("/trackers/discord/:buildId", async (req, res) => {
            res.render('index', {
                page: "trackers/discord/build",
                build: {
                    name: "260196",
                    title: "Build 260192",
                    description: "kerfus build :3",
                    date: "today",
                }
            })
        })

        // TODO: figure out a better way to reduce memory usage
        // currently too many requests hitting this endpoint will result in memory not being cleared properly;
        // so the server gets killed by the oom killer
        this.server.get("/trackers/discord", this.limiter, async (req, res) => {
            const timeElapsedSinceLastFetch = (Date.now() - this.lastBuildFetch) / 1000

            if (this.fetchedBuilds == null || timeElapsedSinceLastFetch >= 60) {
                console.log("Fetching discord builds..")
                let rawBuilds = await database.getBuilds()
                let builds = [] as BuildMetadata[]

                rawBuilds.forEach(build => {
                    if (!build.BuildNumber.startsWith("not-a-real-build")) {
                        builds.push({
                            name: build.BuildNumber,
                            title: `Build ${build.BuildNumber}`,
                            description: "kerfus build :3",
                            date: new Date((build.Date as number)).toLocaleDateString(),
                        })
                    }
                })

                this.fetchedBuilds = builds
                this.lastBuildFetch = Date.now()
            }

            res.render('index', {
                page: "trackers/discord/builds",
                builds: this.fetchedBuilds,
            })
        })

        this.server.get("/blog", async (req, res) => {
            const posts = [] as PostMetadata[]
            const markdownFiles = readdirSync(this.POSTS_LOCATION).filter((post) => post.endsWith(".md"))

            await markdownFiles.forEach((file) => {
                posts.push(this.getPostMetadata(file))
            })

            res.render('index', {
                page: "blog",
                posts: posts
            })
        })

        this.server.get("/blog/:blogId", async (req, res) => {
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
                const post = this.getPostMetadata(`${blogId}.md`)
                const renderedContent = md.render(post.content)
                post.content = renderedContent


                res.render('index', {
                    page: "blogPost",
                    post: post,
                })
            } catch (err) {
                console.log(`: ${err}`)
                this.renderNotFound(res)
            }
        })

        this.server.get("/*", (req, res) => {
            res.status(404)

            if (req.accepts("html")) {
                this.renderNotFound(res)
            } else {
                res.send({
                    message: "404 - page not found"
                })
            }
        })



    },
    start: function () {
        this.server.listen(80, () => {
            console.log("silly website is listening on port 80!")
        })
    }
}

