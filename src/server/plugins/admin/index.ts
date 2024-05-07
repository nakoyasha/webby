import { RouteType, type Plugin, type Route } from "@plugins/pluginInterface";
import type { Express, Request, Response, NextFunction } from "express"
import { restrictToAdmin } from "../access";

import apiRoutes from "./api"

export class AdminPlugin implements Plugin {
    public readonly name = "Admin";
    public readonly routePrefix = "/aaaammdiinnn";
    public readonly routes: Route[] = [
        ...apiRoutes,
        {
            path: "/*",
            type: RouteType.GET,
            async onRequest(request: Request, response: Response, nextFunction: NextFunction) {
                nextFunction()
            }
        },
    ];
    middleware = [restrictToAdmin];
    public async init(server: Express) {
    }
}