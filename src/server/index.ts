import express from "express"
import { configDotenv } from "dotenv"

import { RouteType, type Plugin } from "@plugins/pluginInterface"
import { APIPlugin } from "@plugins/api"
import { poweredByMenheraPlugin } from "@plugins/poweredByMenhera"
import ViewsPlugin from "@plugins/routes"

import StaticPlugin from "@plugins/static"
import CORSPlugin from "@plugins/cors"
import { AntiBotPlugin } from "./plugins/antiBot"
import ConfigurationPlugin from "./plugins/configuration"
import { AdminPlugin } from "./plugins/admin"

import { Worker } from "node:worker_threads"
import Logger from "@shared/logger"

import { join } from "node:path"

export const server = {
    server: express(),
    logger: new Logger("webby"),
    plugins: [
        new ConfigurationPlugin(),
        // new AntiBotPlugin(),
        new StaticPlugin(),
        new CORSPlugin(),
        new APIPlugin(),
        new poweredByMenheraPlugin(),
        new AdminPlugin(),
        new ViewsPlugin(),
    ] as Plugin[],
    init: function () {
        configDotenv({})
        // initialize plugins
        for (const plugin of this.plugins) {
            const routePrefix = plugin?.routePrefix ?? ""

            if (plugin.routes !== undefined) {
                for (const route of plugin.routes) {
                    const routePath = routePrefix + route.path
                    const middleware = (plugin?.middleware as Array<any>) ?? []
                    // the evil route type tree...
                    switch (route.type) {
                        case RouteType.GET:
                            this.server.get(routePath, [...middleware, route.onRequest])
                            break;
                        case RouteType.POST:
                            this.server.post(routePath, [...middleware, route.onRequest])
                            break;
                        case RouteType.PUT:
                            this.server.put(routePath, [...middleware, route.onRequest])
                            break;
                        case RouteType.DELETE:
                            this.server.delete(routePath, [...middleware, route.onRequest])
                            break;
                        case RouteType.PATCH:
                            this.server.patch(routePath, [...middleware, route.onRequest])
                            break;
                        case RouteType.OPTIONS:
                            this.server.options(routePath, [...middleware, route.onRequest])
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

        const taskThread = new Worker(join(__dirname, "threads/taskSystem.js"))

        taskThread.on("message", (msg) => {
            this.logger.log(`Message from TaskSystem: ${msg}`)
        })

        taskThread.on("online", () => {
            this.logger.log("TaskSystem has started")
        })

        taskThread.on("error", (err) => {
            this.logger.error(`TaskSystem thread has encountered an exception: ${err}`)
        })

        taskThread.on("exit", (code) => {
            this.logger.error(`TaskSystem thread has exited with code ${code}`)
        })
    },
    start: function () {
        this.server.listen(process.env.PORT, () => {
            this.logger.log(`Webby listening on port ${process.env.PORT}!`)
        })
    }
}