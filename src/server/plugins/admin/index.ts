import { RouteType, type Plugin, type Route } from "@plugins/pluginInterface";
import type { Express } from "express"
import { restrictToAdmin } from "../access";


export class AdminPlugin implements Plugin {
    public readonly name = "Admin";
    public readonly routePrefix = "/admin";
    public readonly routes: Route[] = [
        {
            path: "/hello-world",
            type: RouteType.GET,
            async onRequest(req, res) {
                res.send("Hello World!")
            }
        }
    ];
    middleware = [restrictToAdmin];
    public async init(server: Express) {
    }
}