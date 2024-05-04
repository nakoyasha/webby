import type { Plugin } from "./pluginInterface";
import { Express, Request, Response, static as staticDir } from "express"
import { join } from "path"

export default class StaticPlugin implements Plugin {
    public readonly name = "Static";
    public static readonly CLIENT_LOCATION: string = join(process.cwd(), "dist/client");
    public static readonly DATA_LOCATION: string = join(process.cwd(), "data");
    public static readonly PUBLIC_LOCATION: string = join(process.cwd(), "public")
    public async init(server: Express) {
        server.use(staticDir(StaticPlugin.CLIENT_LOCATION))
        server.use(staticDir(StaticPlugin.DATA_LOCATION))
        server.use(staticDir(StaticPlugin.PUBLIC_LOCATION))
    }
}