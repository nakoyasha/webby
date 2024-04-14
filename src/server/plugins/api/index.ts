import { type Plugin, type Route } from "../pluginInterface";
import type { Express } from "express"
import buildRoutes from "./builds"
import experimentsRoute from "./experiments"

export class APIPlugin implements Plugin {
    name = "API";
    routePrefix = "/api";
    routes: Route[] = [
        ...buildRoutes,
        ...experimentsRoute
    ]
    async init(server: Express) {
    }
}