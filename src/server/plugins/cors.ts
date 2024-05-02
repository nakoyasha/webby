import type { Plugin } from "./pluginInterface";
import { Express, Request, Response } from "express"

import cors from "cors"

export default class CORSPlugin implements Plugin {
    name = "CORS";
    async init(server: Express) {
        server.use(cors())
    }
}