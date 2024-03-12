import express, { Response } from "express"
import { join } from "path"

import { readFileSync, readdirSync } from "fs"
import matter from "gray-matter"
import highlightjs from "highlight.js"

import markdown from "markdown-it"
import { rateLimit } from 'express-rate-limit'
import { database } from "@system/database"
import { DiscordBranch } from "@util/Tracker/Types/DiscordBranch"
import { config, configDotenv } from "dotenv"


export type PostMetadata = {
    name: string,
    title: string,
    description: string,
    content: string,
    date: string,
}

export type FetchedBuilds = {
    latestBuilds: {
        canary?: BuildMetadata,
        stable?: BuildMetadata,
    },
    builds: BuildMetadata[]
}

export type BuildMetadata = {
    build_number: string,
    build_hash: string,
    branch: DiscordBranch,
    date: string,
}

export const server = {
    server: express(),
    DATA_LOCATION: join(__dirname, "data"),
    POSTS_LOCATION: join(__dirname, "data/posts"),

    renderNotFound: function (res: Response) {
        res.render("index", {
            page: "error",
            message: "oops..."
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

    fetchedBuilds: null as FetchedBuilds | null,
    currentlyFetchingBuilds: false,
    lastBuildFetch: Date.now(),

    limiter: rateLimit({
        windowMs: 60000, // 1 minute per 25 requests
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
        standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
        legacyHeaders: true,

    }),
    init: function () {
        configDotenv({})
        this.server.use((_, response, nextConsumer) => {
            response.set("X-Powered-By", "menhera")
            nextConsumer()
        })

        if (process.env.NODE_ENV == "production") {
            this.server.use((request, response, nextConsumer) => {
                if (
                    request.path.startsWith("/assets/") ||
                    request.path.startsWith("/style/") ||
                    request.path.startsWith("/scripts/")
                ) {
                    response.setHeader("Cache-Control", "public max-age=604800")
                }
                nextConsumer()
            })
        }

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
                    build_number: "260196",
                    build_hash: "masataka-ebina-yep",
                    date: "today",
                }
            })
        })

        this.server.get("/api/v1/portalcord/verification", this.limiter, async (req, res) => {
            // :3
            res.redirect("https://youtu.be/vAvcxeXtBz0?t=11")
        })

        // TODO: figure out a better way to reduce memory usage
        // currently too many requests hitting this endpoint will result in memory not being cleared properly;
        // so the server gets killed by the oom killer
        this.server.get("/trackers/discord", this.limiter, async (req, res) => {
            if (this.currentlyFetchingBuilds == true) {
                // throw a Service Unavailable and tell them to wait a minute.
                res.status(503)
                res.setHeader("Retry-After", "60")
                res.render('index', {
                    page: "error",
                    message: "The server is currently busy fetching builds. Please wait !!"
                })
                return;
            }

            const timeElapsedSinceLastFetch = (Date.now() - this.lastBuildFetch) / 1000

            if (this.fetchedBuilds == null || timeElapsedSinceLastFetch >= 60) {
                let startedAt = Date.now()
                this.currentlyFetchingBuilds = true
                console.log("Fetching discord builds..")
                let rawBuilds = await database.getBuilds()
                // let latestBuilds = await database.getLastBuilds()
                let builds = {
                    latestBuilds: {
                        canary: undefined,
                        stable: undefined,
                    },
                    builds: [],
                } as FetchedBuilds

                rawBuilds.forEach(build => {
                    if (!build.BuildNumber.startsWith("not-a-real-build")) {
                        console.log(`Pushing build ${build.BuildNumber}`)
                        builds.builds.push({
                            build_number: build.BuildNumber,
                            build_hash: build.VersionHash,
                            branch: build.Branch,
                            date: new Date(build.Date).toLocaleDateString(),
                        })
                    }
                })

                this.fetchedBuilds = builds
                this.currentlyFetchingBuilds = false
                this.lastBuildFetch = Date.now()
                console.log(`Finished fetching builds in ${this.lastBuildFetch - startedAt}`)
            }

            res.render('index', {
                page: "trackers/discord/builds",
                builds: this.fetchedBuilds.builds,
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
        this.server.listen(process.env.PORT, () => {
            console.log(`silly website is listening on port ${process.env.PORT}!`)
        })
    }
}

