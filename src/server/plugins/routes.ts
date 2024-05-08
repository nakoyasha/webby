import type { Plugin } from "@plugins/pluginInterface";
import { Express, Request, Response } from "express"
import { join } from "path"
import StaticPlugin from "@plugins/static";

export default class RoutesPLugin implements Plugin {
    public readonly name = "Routes";
    private readonly AVAILABLE_ROUTES = [
        "/",
        "/trackers",
        "/trackers/*",
        "/blog/*",
        "/projects",
        "/aaaammdiinnn/*",
        "/assets/*",
    ]

    public async init(server: Express) {
        // we have an spa silly
        server.get(this.AVAILABLE_ROUTES, (_: Request, response: Response) => {
            response.sendFile(join(StaticPlugin.CLIENT_LOCATION, "index.html"))
        })

        server.all("*", (_, response: Response) => {
            response
                .status(404)
                .sendFile(join(StaticPlugin.CLIENT_LOCATION, "index.html"))
        })
    }
}