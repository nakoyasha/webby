import { type Plugin, type Route } from "@plugins/pluginInterface";
import type { Express } from "express"
import buildRoutes from "./builds"
import experimentsRoute from "./experiments"

export class APIPlugin implements Plugin {
    public readonly name = "API";
    public readonly routePrefix = "/api";
    public readonly routes: Route[] = [
        ...buildRoutes,
        ...experimentsRoute
    ]
    public async init(server: Express) {
    }
}