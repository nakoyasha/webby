import type { Plugin } from "@plugins/pluginInterface";
import { Express, Request, Response } from "express"
import { join } from "path"
import StaticPlugin from "@plugins/static";

export default class RoutesPLugin implements Plugin {
    name = "Routes";
    async init(server: Express) {

        // we have an spa silly
        server.get("*", (_: Request, response: Response) => {
            response.sendFile(join(StaticPlugin.CLIENT_LOCATION, "index.html"))
        })
    }
}