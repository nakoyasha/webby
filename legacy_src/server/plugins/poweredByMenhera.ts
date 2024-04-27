import type { Plugin } from "./pluginInterface"
import type { Express } from "express"

export class poweredByMenheraPlugin implements Plugin {
    name = "PoweredByMenhera"
    async init(server: Express) {
        server.use((_, response, nextConsumer) => {
            response.set("X-Powered-By", "menhera")
            nextConsumer()
        })
    }
}