
import { Application, NextFunction, Request, Response } from "express";
import type { Plugin } from "./pluginInterface";

export default class CloudflarePlugin implements Plugin {
    public readonly name = "Cloudflare";

    public async init(server: Application) {
        server.use((request: Request, response: Response, nextFunction: NextFunction) => {
            const cloudflareIP = request.headers["cf-connecting-ip"] as string
            const hasCloudflareIP = cloudflareIP != undefined

            if (hasCloudflareIP) {
                request.ip = cloudflareIP
            }

            nextFunction()
        })
    }
}