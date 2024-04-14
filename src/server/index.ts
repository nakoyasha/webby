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

import { RouteType, type Plugin } from "./plugins/pluginInterface"
import { APIPlugin } from "./plugins/api"
import { poweredByMenheraPlugin } from "./plugins/poweredByMenhera"
import ViewsPlugin from "./plugins/views"

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
    build_number: number,
    build_hash: string,
    branches: DiscordBranch[],
    date: String,
}

export const server = {
    server: express(),
    POSTS_LOCATION: join(__dirname, "data/posts"),
    plugins: [
        new ViewsPlugin(),
        new APIPlugin(),
        new poweredByMenheraPlugin(),
    ] as Plugin[],
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
        // initialize plugins
        for (const plugin of this.plugins) {
            const routePrefix = plugin?.routePrefix ?? ""

            if (plugin.routes !== undefined) {
                for (const route of plugin.routes) {
                    const routePath = routePrefix + route.path
                    // the evil route type tree...
                    switch (route.type) {
                        case RouteType.GET:
                            this.server.get(routePath, route.onRequest)
                            break;
                        case RouteType.POST:
                            this.server.post(routePath, route.onRequest)
                            break;
                        case RouteType.PUT:
                            this.server.put(routePath, route.onRequest)
                            break;
                        case RouteType.DELETE:
                            this.server.delete(routePath, route.onRequest)
                            break;
                        case RouteType.PATCH:
                            this.server.patch(routePath, route.onRequest)
                            break;
                        case RouteType.OPTIONS:
                            this.server.options(routePath, route.onRequest)
                            break;
                    }
                }
            }

            plugin.init(this.server)
        }

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
                console.time("fetch-discord-builds")
                let rawBuilds = await database.getBuilds()
                let builds = {
                    latestBuilds: {
                        canary: undefined,
                        stable: undefined,
                    },
                    builds: [],
                } as FetchedBuilds

                rawBuilds.forEach(build => {
                    const branches = build.branches.map((branch) => {
                        if (branch == DiscordBranch.Stable) {
                            return "stable"
                        }

                        if (branch == DiscordBranch.PTB) {
                            return "ptb"
                        }

                        if (branch == DiscordBranch.Canary) {
                            return "canary"
                        }


                        return "unknown-build-this-should-never-be-seen-uh"
                    })

                    console.log(branches)

                    if (!build.build_hash.startsWith("not-a-real-build")) {
                        builds.builds.push({
                            build_number: build.build_number,
                            build_hash: build.build_hash,
                            branches: branches as any,
                            date: build.date_found.toLocaleDateString(),
                        })
                    }
                })

                this.fetchedBuilds = builds
                this.currentlyFetchingBuilds = false
                this.lastBuildFetch = Date.now()
                console.timeEnd("fetch-discord-builds")
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

                    return ''; // use external default escAPIPluginng
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
                console.error(`: ${err}`)
            }
        })

        this.server.use((req, res, nextConsumer) => {
            // 404 page at the very bottom..
            res.status(404)
            res.render("index", {
                page: "error",
                message: "oops..."
            })
        })
    },
    start: function () {
        this.server.listen(process.env.PORT, () => {
            console.log(`silly website is listening on port ${process.env.PORT}!`)
        })
    }
}

