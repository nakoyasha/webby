import type { Plugin } from "./pluginInterface";
import { Express, Request, Response, static as staticDir } from "express"
import { join } from "path"

export default class StaticPlugin implements Plugin {
    name = "Static";
    static readonly CLIENT_LOCATION: string = join(process.cwd(), "dist/client");
    static readonly DATA_LOCATION: string = join(process.cwd(), "data");
    static readonly PUBLIC_LOCATION: string = join(process.cwd(), "public")
    async init(server: Express) {
        server.use(staticDir(StaticPlugin.CLIENT_LOCATION))
        server.use(staticDir(StaticPlugin.DATA_LOCATION))
        server.use(staticDir(StaticPlugin.PUBLIC_LOCATION))
    }
}